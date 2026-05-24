import { NextRequest, NextResponse } from "next/server";
import { DesignLayer, getAvailableShippingMethods, Order } from "@/data/shop";
import { calculateDiscount } from "@/features/discounts/data/discounts";
import { getSiteSettings } from "@/features/site-settings/data/site-settings";
import { getOrCreateCustomerForEmail } from "@/lib/auth/customer";
import { createSupabaseAdminClient } from "@/lib/supabase/service";

function stripeProductType(productId: string) {
  if (productId === "classic-tee") return "shirts";
  if (productId === "business-cards") return "business-cards";
  if (productId === "die-cut-stickers") return "stickers";
  return "custom";
}

function compactMetadataValue(value: unknown) {
  const serialized = JSON.stringify(value ?? {});
  return serialized.length > 450 ? serialized.slice(0, 450) : serialized;
}

function dataUrlToUpload(dataUrl: string) {
  const match = dataUrl.match(/^data:([-+\w.]+\/[-+\w.]+);base64,(.+)$/);

  if (!match?.[2]) return null;

  const mimeType = match[1] || "image/png";
  const extension = mimeType.includes("jpeg") ? "jpg" : mimeType.split("/")[1] || "png";

  return {
    buffer: Buffer.from(match[2], "base64"),
    mimeType,
    extension,
  };
}

async function uploadPrintAsset({
  orderId,
  itemId,
  productId,
  side,
  role,
  dataUrl,
  placement,
}: {
  orderId: string;
  itemId: string;
  productId: string;
  side: "front" | "back";
  role: "print_area" | "source_layer";
  dataUrl?: string | null;
  placement: Record<string, unknown>;
}) {
  if (!dataUrl?.startsWith("data:image/")) return null;

  const upload = dataUrlToUpload(dataUrl);
  if (!upload) return null;

  const supabase = createSupabaseAdminClient();
  const fileName = `${role}-${side}-${crypto.randomUUID()}.${upload.extension}`;
  const path = `checkout/${orderId}/${itemId}/${fileName}`;

  const { error: storageError } = await supabase.storage.from("uploads").upload(path, upload.buffer, {
    contentType: upload.mimeType,
    upsert: true,
  });

  if (storageError) {
    console.warn("Print asset upload failed:", storageError.message);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("uploads").getPublicUrl(path);

  const { data, error } = await supabase
    .from("uploads")
    .insert({
      file_name: fileName,
      file_url: publicUrl,
      preview_url: publicUrl,
      mime_type: upload.mimeType,
      file_size: upload.buffer.length,
      upload_status: "uploaded",
      print_side: side,
      asset_role: role,
      placement: {
        order_client_id: orderId,
        cart_item_id: itemId,
        product_id: productId,
        ...placement,
      },
    })
    .select("id")
    .single<{ id: string }>();

  if (error) {
    if (error.code !== "42703") {
      console.warn("Print asset database insert failed:", error.message);
      return null;
    }

    const { data: legacyData, error: legacyError } = await supabase
      .from("uploads")
      .insert({
        file_name: fileName,
        file_url: publicUrl,
        preview_url: publicUrl,
        mime_type: upload.mimeType,
        file_size: upload.buffer.length,
        upload_status: "uploaded",
      })
      .select("id")
      .single<{ id: string }>();

    if (legacyError) {
      console.warn("Legacy print asset database insert failed:", legacyError.message);
      return null;
    }

    return legacyData?.id ?? null;
  }

  return data?.id ?? null;
}

async function uploadOrderPrintAssets(order: Order) {
  const uploadIds: string[] = [];

  for (const item of order.items) {
    const printAssets = [
      { side: "front" as const, dataUrl: item.frontPreview },
      { side: "back" as const, dataUrl: item.backPreview },
    ];

    for (const asset of printAssets) {
      const uploadId = await uploadPrintAsset({
        orderId: order.id,
        itemId: item.id,
        productId: item.productId,
        side: asset.side,
        role: "print_area",
        dataUrl: asset.dataUrl,
        placement: {
          description: "Flattened clipped printable area",
        },
      });

      if (uploadId) uploadIds.push(uploadId);
    }

    const layerGroups: Array<{ side: "front" | "back"; layers: DesignLayer[] }> = [
      { side: "front", layers: item.frontLayers },
      { side: "back", layers: item.backLayers },
    ];

    for (const group of layerGroups) {
      for (const layer of group.layers) {
        if (layer.type !== "image") continue;

        const uploadId = await uploadPrintAsset({
          orderId: order.id,
          itemId: item.id,
          productId: item.productId,
          side: group.side,
          role: "source_layer",
          dataUrl: layer.originalPreview || layer.preview,
          placement: {
            layer_id: layer.id,
            x: layer.x,
            y: layer.y,
            width: layer.width ?? null,
            height: layer.height ?? null,
            rotation: layer.rotation,
          },
        });

        if (uploadId) uploadIds.push(uploadId);
      }
    }
  }

  return uploadIds;
}

async function finalizeTestModeOrder({
  order,
  uploadIds,
  discountAmountCents,
  shippingDiscountCents,
  shippingCents,
  subtotalCents,
  totalCents,
}: {
  order: Order;
  uploadIds: string[];
  discountAmountCents: number;
  shippingDiscountCents: number;
  shippingCents: number;
  subtotalCents: number;
  totalCents: number;
}) {
  const supabase = createSupabaseAdminClient();
  const customer = await getOrCreateCustomerForEmail({
    email: order.customer.email,
    name: order.customer.name,
  });
  const now = new Date().toISOString();
  const shippingAddress = {
    line1: order.customer.address,
    city: order.customer.city,
    state: order.customer.region,
    postal_code: order.customer.postal,
    country: "CA",
  };
  const orderPayload = {
    order_number: order.id,
    customer_id: customer.id,
    auth_user_id: customer.auth_user_id ?? null,
    customer_email: order.customer.email,
    customer_name: order.customer.name,
    customer_phone: order.customer.phone,
    shipping_address: shippingAddress,
    billing_address: shippingAddress,
    production_status: "pending",
    payment_status: "paid",
    subtotal_cents: subtotalCents,
    discount_cents: discountAmountCents + shippingDiscountCents,
    shipping_cents: shippingCents,
    tax_cents: 0,
    total_cents: totalCents,
    tax_breakdown: {
      test_mode: true,
      note: "No payment collected. Stripe Tax is bypassed for this internal test order.",
    },
    shipping_method: order.shippingMethod ?? null,
    shipping_cost_cents: shippingCents,
    checkout_session_id: `test_${order.id}`,
    guest_checkout: !customer.auth_user_id,
    currency: "CAD",
    notes: `TEST MODE - no payment collected.\n${order.customer.notes ?? ""}`.trim(),
    source: "storefront",
    external_order_id: `test_${order.id}`,
    created_at: now,
    updated_at: now,
  };

  const { data: createdOrder, error: orderError } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select("id")
    .single<{ id: string }>();

  if (orderError || !createdOrder) {
    throw orderError ?? new Error("Test order could not be created.");
  }

  const orderItems = order.items.map((item) => ({
    order_id: createdOrder.id,
    product_id: item.productId,
    product_name: item.productName,
    sku: `${item.productId}-${item.size}`.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    quantity: item.quantity,
    unit_price_cents: Math.round(item.unitPrice * 100),
    line_total_cents: Math.round(item.lineTotal * 100),
    customization: {
      size: item.size,
      color: item.color,
      front_layers: item.frontLayers,
      back_layers: item.backLayers,
      front_print_area_url: item.frontPreview,
      back_print_area_url: item.backPreview,
      mockup_preview_url: item.mockupPreview,
      uploaded_print_asset_ids: uploadIds,
      test_mode: true,
    },
  }));

  if (orderItems.length) {
    const { error: itemError } = await supabase.from("order_items").insert(orderItems);
    if (itemError) throw itemError;
  }

  await supabase
    .from("uploads")
    .update({ order_id: createdOrder.id, updated_at: now })
    .in("id", uploadIds);

  await supabase.from("production_status_history").insert({
    order_id: createdOrder.id,
    status: "pending",
    notes: "Test mode order created without payment. Use this to verify artwork, clipping, printing, packing, and shipping workflow.",
    changed_by: "test_mode",
  });

  return createdOrder.id;
}

export async function POST(req: NextRequest) {
  try {
    const order = (await req.json()) as Order;
    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    if (!order?.items?.length || !order.customer?.email) {
      return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 });
    }

    const settings = await getSiteSettings();
    const firstItem = order.items[0];
    const designReferences = order.items.flatMap((item) => [item.frontPreview, item.backPreview].filter(Boolean));
    const subtotalCents = Math.round(order.subtotal * 100);
    const shippingMethods = getAvailableShippingMethods(order.items);
    const selectedShipping = shippingMethods.find((method) => method.code === order.shippingMethod) ?? shippingMethods[0];
    const shippingCents = Math.round((selectedShipping?.price ?? order.shipping) * 100);
    const discount = await calculateDiscount({
      code: order.discountCode,
      customerEmail: order.customer.email,
      subtotalCents,
      shippingCents,
      items: order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        lineTotalCents: Math.round(item.lineTotal * 100),
      })),
    });
    const finalShippingCents = discount.finalShippingCents;
    const estimatedTotalCents = discount.finalSubtotalCents + finalShippingCents;
    const uploadIds = await uploadOrderPrintAssets(order);

    if (settings.test_mode_enabled) {
      const dbOrderId = await finalizeTestModeOrder({
        order,
        uploadIds,
        discountAmountCents: discount.discountAmountCents,
        shippingDiscountCents: discount.shippingDiscountCents,
        shippingCents: finalShippingCents,
        subtotalCents,
        totalCents: estimatedTotalCents,
      });

      return NextResponse.json({
        mode: "test",
        url: `${origin}/success?order=${encodeURIComponent(order.id)}&mode=test&db_order=${encodeURIComponent(dbOrderId)}`,
      });
    }

    const stripeKey = settings.test_mode_enabled && process.env.STRIPE_TEST_SECRET_KEY ? process.env.STRIPE_TEST_SECRET_KEY : process.env.STRIPE_SECRET_KEY;

    if (!stripeKey) {
      return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
    }
    const params = new URLSearchParams({
      mode: "payment",
      success_url: `${origin}/success?order=${encodeURIComponent(order.id)}&mode=stripe&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      customer_email: order.customer.email,
      "metadata[order_id]": order.id,
      "metadata[source]": "cart",
      "metadata[test_mode]": settings.test_mode_enabled ? "true" : "false",
      "metadata[product_type]": stripeProductType(firstItem.productId),
      "metadata[product_id]": firstItem.productId,
      "metadata[product_name]": firstItem.productName,
      "metadata[quantity]": String(firstItem.quantity),
      "metadata[discount_id]": discount.discount?.id ?? "",
      "metadata[discount_code]": discount.discount?.code ?? order.discountCode ?? "",
      "metadata[discount_amount_cents]": String(discount.discountAmountCents),
      "metadata[shipping_discount_cents]": String(discount.shippingDiscountCents),
      "metadata[estimated_total_before_tax_cents]": String(estimatedTotalCents),
      "metadata[shipping_method]": selectedShipping?.code ?? "tracked",
      "metadata[shipping_cents]": String(finalShippingCents),
      "metadata[upload_ids]": compactMetadataValue(uploadIds),
      "metadata[design_references]": compactMetadataValue(designReferences),
      "metadata[customization]": compactMetadataValue({
        cart_item_count: order.items.length,
        first_item: {
          productId: firstItem.productId,
          size: firstItem.size,
          color: firstItem.color.name,
          frontLayers: firstItem.frontLayers.length,
          backLayers: firstItem.backLayers.length,
        },
      }),
      "metadata[customer_name]": order.customer.name,
      "metadata[customer_phone]": order.customer.phone,
    });

    params.append("billing_address_collection", "auto");
    params.append("phone_number_collection[enabled]", "true");
    params.append("shipping_address_collection[allowed_countries][0]", "CA");
    params.append("shipping_address_collection[allowed_countries][1]", "US");
    params.append("automatic_tax[enabled]", "true");
    params.append("client_reference_id", order.id);

    params.append("line_items[0][quantity]", "1");
    params.append("line_items[0][price_data][currency]", "cad");
    params.append("line_items[0][price_data][unit_amount]", String(discount.finalSubtotalCents));
    params.append("line_items[0][price_data][tax_behavior]", "exclusive");
    params.append("line_items[0][price_data][product_data][name]", order.items.length === 1 ? firstItem.productName : `PRNTD Custom Order (${order.items.length} items)`);
    params.append(
      "line_items[0][price_data][product_data][description]",
      discount.discount ? `Includes backend discount: ${discount.discount.title}` : "Custom print order subtotal"
    );

    if (finalShippingCents > 0 || selectedShipping) {
      params.append("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
      params.append("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(finalShippingCents));
      params.append("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "cad");
      params.append("shipping_options[0][shipping_rate_data][display_name]", selectedShipping?.name ?? "Shipping");
      params.append("shipping_options[0][shipping_rate_data][tax_behavior]", "exclusive");
    }

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": order.id,
      },
      body: params,
    });

    const session = (await response.json()) as { url?: string; error?: { message?: string } };

    if (!response.ok || !session.url) {
      return NextResponse.json({ error: session.error?.message ?? "Stripe checkout failed" }, { status: 502 });
    }

    return NextResponse.json({ mode: "stripe", url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
