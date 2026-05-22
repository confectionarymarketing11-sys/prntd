import { NextRequest, NextResponse } from "next/server";
import { Order } from "@/data/shop";

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

    order.items.forEach((item, index) => {
      params.append(`line_items[${index}][quantity]`, String(item.quantity));
      params.append(`line_items[${index}][price_data][currency]`, "cad");
      params.append(`line_items[${index}][price_data][unit_amount]`, String(Math.round(item.unitPrice * 100)));
      params.append(`line_items[${index}][price_data][product_data][name]`, item.productName);
      params.append(
        `line_items[${index}][price_data][product_data][description]`,
        `${item.size} / ${item.color.name} / custom print`
      );
    });

    const shippingIndex = order.items.length;
    params.append(`line_items[${shippingIndex}][quantity]`, "1");
    params.append(`line_items[${shippingIndex}][price_data][currency]`, "cad");
    params.append(`line_items[${shippingIndex}][price_data][unit_amount]`, String(Math.round((order.shipping + order.tax) * 100)));
    params.append(`line_items[${shippingIndex}][price_data][product_data][name]`, "Shipping and estimated tax");

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
