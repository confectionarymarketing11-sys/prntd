import { NextRequest, NextResponse } from "next/server";
import { Order } from "@/data/shop";
import { calculateDiscount } from "@/features/discounts/data/discounts";

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

export async function POST(req: NextRequest) {
  try {
    const order = (await req.json()) as Order;
    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    if (!order?.items?.length || !order.customer?.email) {
      return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
    }

    const firstItem = order.items[0];
    const designReferences = order.items.flatMap((item) => [item.frontPreview, item.backPreview].filter(Boolean));
    const subtotalCents = Math.round(order.subtotal * 100);
    const shippingCents = Math.round(order.shipping * 100);
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
    const taxCents = Math.round(discount.finalSubtotalCents * 0.0825);
    const finalTotalCents = discount.finalSubtotalCents + finalShippingCents + taxCents;
    const params = new URLSearchParams({
      mode: "payment",
      success_url: `${origin}/success?order=${encodeURIComponent(order.id)}&mode=stripe&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      customer_email: order.customer.email,
      "metadata[order_id]": order.id,
      "metadata[source]": "cart",
      "metadata[product_type]": stripeProductType(firstItem.productId),
      "metadata[product_id]": firstItem.productId,
      "metadata[product_name]": firstItem.productName,
      "metadata[quantity]": String(firstItem.quantity),
      "metadata[discount_id]": discount.discount?.id ?? "",
      "metadata[discount_code]": discount.discount?.code ?? order.discountCode ?? "",
      "metadata[discount_amount_cents]": String(discount.discountAmountCents),
      "metadata[shipping_discount_cents]": String(discount.shippingDiscountCents),
      "metadata[final_total_cents]": String(finalTotalCents),
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

    params.append("line_items[0][quantity]", "1");
    params.append("line_items[0][price_data][currency]", "cad");
    params.append("line_items[0][price_data][unit_amount]", String(discount.finalSubtotalCents));
    params.append("line_items[0][price_data][product_data][name]", order.items.length === 1 ? firstItem.productName : `PRNTD Custom Order (${order.items.length} items)`);
    params.append(
      "line_items[0][price_data][product_data][description]",
      discount.discount ? `Includes backend discount: ${discount.discount.title}` : "Custom print order subtotal"
    );

    params.append("line_items[1][quantity]", "1");
    params.append("line_items[1][price_data][currency]", "cad");
    params.append("line_items[1][price_data][unit_amount]", String(finalShippingCents + taxCents));
    params.append("line_items[1][price_data][product_data][name]", "Shipping and estimated tax");

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
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
