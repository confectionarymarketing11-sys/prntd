import Stripe from "stripe";
import { getEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { getStripeCheckoutProductByPrice } from "@/lib/stripe-products";
import { createSupabaseAdminClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toAddress(address: Stripe.Address | null | undefined) {
  if (!address) return {};

  return {
    line1: address.line1 ?? "",
    line2: address.line2 ?? "",
    city: address.city ?? "",
    state: address.state ?? "",
    postal_code: address.postal_code ?? "",
    country: address.country ?? "",
  };
}

function parseCustomization(value: string | undefined) {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value) as unknown;

    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const stripe = getStripe();
  const supabase = createSupabaseAdminClient();
  const orderNumber = `STRIPE-${session.id}`;

  const { data: existingOrder, error: existingError } = await supabase
    .from("orders")
    .select("id")
    .eq("order_number", orderNumber)
    .maybeSingle<{ id: string }>();

  if (existingError) {
    throw existingError;
  }

  if (existingOrder) {
    return;
  }

  const customerEmail = session.customer_details?.email || session.customer_email || "";

  if (!customerEmail) {
    throw new Error(`Stripe session ${session.id} is missing customer email.`);
  }

  const email = customerEmail.toLowerCase().trim();
  const customerName = session.customer_details?.name ?? null;
  const customerPhone = session.customer_details?.phone ?? null;
  const shippingAddress = toAddress(session.customer_details?.address);
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ["data.price"],
  });

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .upsert(
      {
        email,
        name: customerName,
        phone: customerPhone,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    )
    .select("id")
    .single<{ id: string }>();

  if (customerError) {
    throw customerError;
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id: customer.id,
      customer_email: email,
      customer_name: customerName,
      customer_phone: customerPhone,
      shipping_address: shippingAddress,
      billing_address: toAddress(session.customer_details?.address),
      production_status: "pending",
      payment_status: session.payment_status === "paid" ? "paid" : "authorized",
      subtotal_cents: session.amount_subtotal ?? 0,
      shipping_cents: 0,
      tax_cents: (session.total_details?.amount_tax ?? 0),
      total_cents: session.amount_total ?? 0,
      currency: (session.currency ?? "cad").toUpperCase(),
      notes: null,
      source: "api",
      external_order_id: session.id,
    })
    .select("id")
    .single<{ id: string }>();

  if (orderError) {
    throw orderError;
  }

  const fallbackProductType = session.metadata?.product_type ?? "custom";
  const fallbackProductId = session.metadata?.product_id ?? fallbackProductType;
  const fallbackProductName = session.metadata?.product_name ?? "Custom PRNTD Product";
  const customization = parseCustomization(session.metadata?.customization);

  const items = lineItems.data.map((item) => {
    const priceId = typeof item.price === "string" ? item.price : item.price?.id ?? "";
    const product = getStripeCheckoutProductByPrice(priceId);
    const quantity = item.quantity ?? (Number(session.metadata?.quantity ?? 1) || 1);
    const lineTotal = item.amount_total ?? item.amount_subtotal ?? 0;

    return {
      order_id: order.id,
      product_id: product?.fulfillmentProductId ?? fallbackProductId,
      product_name: item.description || product?.label || fallbackProductName,
      sku: priceId || null,
      quantity,
      unit_price_cents: quantity > 0 ? Math.round(lineTotal / quantity) : lineTotal,
      line_total_cents: lineTotal,
      customization: {
        product_type: product?.type ?? fallbackProductType,
        stripe_price_id: priceId,
        ...customization,
      },
    };
  });

  if (items.length) {
    const { error: itemError } = await supabase.from("order_items").insert(items);

    if (itemError) {
      throw itemError;
    }
  }

  const { error: statusError } = await supabase.from("production_status_history").insert({
    order_id: order.id,
    status: "pending",
    notes: "Stripe checkout completed.",
    changed_by: "stripe",
  });

  if (statusError) {
    throw statusError;
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, getEnv("STRIPE_WEBHOOK_SECRET"));
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handling failed:", error);
    return Response.json({ error: "Webhook handling failed" }, { status: 500 });
  }
}
