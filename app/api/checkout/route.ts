import { NextRequest, NextResponse } from "next/server";
import { Order } from "@/data/shop";
import { persistStorefrontOrder } from "@/features/admin/data/order-ingest";

export async function POST(req: NextRequest) {
  try {
    const order = (await req.json()) as Order;
    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    if (!order?.items?.length || !order.customer?.email) {
      return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 });
    }

    await persistStorefrontOrder(order);

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        mode: "manual",
        url: `${origin}/success?order=${encodeURIComponent(order.id)}&mode=manual`,
      });
    }

    const params = new URLSearchParams({
      mode: "payment",
      success_url: `${origin}/success?order=${encodeURIComponent(order.id)}&mode=stripe`,
      cancel_url: `${origin}/cart`,
      customer_email: order.customer.email,
      "metadata[order_id]": order.id,
    });

    order.items.forEach((item, index) => {
      params.append(`line_items[${index}][quantity]`, String(item.quantity));
      params.append(`line_items[${index}][price_data][currency]`, "usd");
      params.append(`line_items[${index}][price_data][unit_amount]`, String(Math.round(item.unitPrice * 100)));
      params.append(`line_items[${index}][price_data][product_data][name]`, item.productName);
      params.append(
        `line_items[${index}][price_data][product_data][description]`,
        `${item.size} / ${item.color.name} / custom print`
      );
    });

    const shippingIndex = order.items.length;
    params.append(`line_items[${shippingIndex}][quantity]`, "1");
    params.append(`line_items[${shippingIndex}][price_data][currency]`, "usd");
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
