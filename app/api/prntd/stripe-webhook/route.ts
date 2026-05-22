import Stripe from "stripe";
import { getEnv } from "@/lib/env";
import { getOrCreateCustomerForEmail, PlatformCustomer } from "@/lib/auth/customer";
import { recordCreditTransaction } from "@/lib/credits";
import { getStripe } from "@/lib/stripe";
import {
  getStripeCheckoutProductByPrice,
  inferSubscriptionTier,
  subscriptionCreditGrants,
} from "@/lib/stripe-products";
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

function parseMetadataJson(value: string | undefined) {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value) as unknown;

    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function parseMetadataArray(value: string | undefined) {
  const parsed = parseMetadataJson(value);

  return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
}

function stripeCustomerId(value: string | Stripe.Customer | Stripe.DeletedCustomer | null) {
  if (!value) return "";
  return typeof value === "string" ? value : value.id;
}

function stripeSubscriptionId(value: string | Stripe.Subscription | null | undefined) {
  if (!value) return "";
  return typeof value === "string" ? value : value.id;
}

function subscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const value = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end;
  return value ? new Date(value * 1000).toISOString() : null;
}

function invoiceSubscriptionId(invoice: Stripe.Invoice) {
  const compatibleInvoice = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
    parent?: {
      subscription_details?: {
        subscription?: string | null;
      } | null;
    } | null;
  };

  return stripeSubscriptionId(compatibleInvoice.subscription) || compatibleInvoice.parent?.subscription_details?.subscription || "";
}

async function registerStripeEvent(event: Stripe.Event) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("stripe_events").insert({
    id: event.id,
    event_type: event.type,
    livemode: event.livemode,
  });

  if (!error) return true;

  if (error.code === "23505") {
    return false;
  }

  if (error.code === "42P01") {
    console.warn("stripe_events table is missing; webhook idempotency is limited until migration is applied.");
    return true;
  }

  throw error;
}

async function markStripeEventProcessed(eventId: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("stripe_events")
    .update({
      processed_at: new Date().toISOString(),
    })
    .eq("id", eventId);

  if (error && error.code !== "42P01") {
    throw error;
  }
}

async function findCustomerByStripeCustomerId(stripeId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("customers")
    .select(
      "id, auth_user_id, email, name, phone, company, stripe_customer_id, shopify_customer_id, credits_balance, subscription_status, plan_tier, stripe_subscription_id, subscription_current_period_end"
    )
    .eq("stripe_customer_id", stripeId)
    .maybeSingle<PlatformCustomer>();

  if (error) return null;

  return data;
}

async function getCustomerFromStripeCustomer(stripeId: string) {
  const existing = await findCustomerByStripeCustomerId(stripeId);
  if (existing) return existing;

  const stripe = getStripe();
  const stripeCustomer = await stripe.customers.retrieve(stripeId);

  if (stripeCustomer.deleted || !stripeCustomer.email) {
    return null;
  }

  return getOrCreateCustomerForEmail({
    email: stripeCustomer.email,
    name: stripeCustomer.name ?? null,
    stripeCustomerId: stripeId,
  });
}

function inferPlanFromSubscription(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0];
  const price = item?.price;

  return inferSubscriptionTier(price?.lookup_key || price?.nickname || price?.id || "");
}

async function updateCustomerSubscription(subscription: Stripe.Subscription, eventId: string) {
  const stripeId = stripeCustomerId(subscription.customer);
  if (!stripeId) return;

  const customer = await getCustomerFromStripeCustomer(stripeId);
  if (!customer) return;

  const planTier = inferPlanFromSubscription(subscription);
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("customers")
    .update({
      stripe_customer_id: stripeId,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      plan_tier: planTier,
      subscription_current_period_end: subscriptionPeriodEnd(subscription),
      updated_at: new Date().toISOString(),
    })
    .eq("id", customer.id);

  if (error && error.code !== "42703") {
    throw error;
  }

  if (subscription.status === "active" || subscription.status === "trialing") {
    console.log(`Subscription ${subscription.id} synced for customer ${customer.id} from event ${eventId}.`);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, eventId: string) {
  const stripeId = stripeCustomerId(invoice.customer);
  if (!stripeId) return;

  const customer = await getCustomerFromStripeCustomer(stripeId);
  if (!customer) return;

  const subscriptionId = invoiceSubscriptionId(invoice);
  if (!subscriptionId) return;

  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  const planTier = inferPlanFromSubscription(subscription);
  const grant = subscriptionCreditGrants[planTier] ?? 0;

  if (!grant) return;

  const supabase = createSupabaseAdminClient();
  const nextCredits = Number(customer.credits_balance ?? 0) + grant;
  const { error } = await supabase
    .from("customers")
    .update({
      credits_balance: nextCredits,
      subscription_status: subscription.status,
      plan_tier: planTier,
      stripe_subscription_id: subscription.id,
      subscription_current_period_end: subscriptionPeriodEnd(subscription),
      updated_at: new Date().toISOString(),
    })
    .eq("id", customer.id);

  if (error && error.code !== "42703") {
    throw error;
  }

  if (!error) {
    await recordCreditTransaction({
      customerId: customer.id,
      authUserId: customer.auth_user_id,
      amount: grant,
      reason: "subscription_grant",
      source: "stripe_invoice",
      stripeEventId: eventId,
      metadata: {
        invoice_id: invoice.id,
        subscription_id: subscription.id,
        plan_tier: planTier,
      },
    });
  }
}

async function attachUploadsToOrder(orderId: string, uploadIds: string[], designReferences: string[]) {
  const supabase = createSupabaseAdminClient();

  if (uploadIds.length) {
    const { error } = await supabase.from("uploads").update({ order_id: orderId }).in("id", uploadIds);
    if (error && error.code !== "42703") throw error;
  }

  if (designReferences.length) {
    await supabase.from("production_status_history").insert({
      order_id: orderId,
      status: "pending",
      notes: `Design references: ${designReferences.join(", ")}`,
      changed_by: "stripe",
    });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== "payment") return;
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    console.warn(`Checkout session ${session.id} completed without paid status: ${session.payment_status}`);
    return;
  }

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
  const stripeId = stripeCustomerId(session.customer);
  const customer =
    session.metadata?.customer_id && email
      ? await getOrCreateCustomerForEmail({
          email,
          authUserId: session.metadata.auth_user_id || null,
          name: customerName,
          stripeCustomerId: stripeId || session.metadata.stripe_customer_id || null,
        })
      : await getOrCreateCustomerForEmail({
          email,
          name: customerName,
          stripeCustomerId: stripeId || null,
        });
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ["data.price"],
  });

  let orderId = "";
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id: customer.id,
      auth_user_id: customer.auth_user_id ?? null,
      customer_email: email,
      customer_name: customerName,
      customer_phone: customerPhone,
      shipping_address: shippingAddress,
      billing_address: toAddress(session.customer_details?.address),
      production_status: "pending",
      payment_status: "paid",
      subtotal_cents: session.amount_subtotal ?? 0,
      shipping_cents: 0,
      tax_cents: session.total_details?.amount_tax ?? 0,
      total_cents: session.amount_total ?? 0,
      currency: (session.currency ?? "cad").toUpperCase(),
      notes: null,
      source: "api",
      external_order_id: session.id,
    })
    .select("id")
    .single<{ id: string }>();

  if (orderError) {
    if (orderError.code === "42703") {
      const { data: legacyOrder, error: legacyOrderError } = await supabase
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
          payment_status: "paid",
          subtotal_cents: session.amount_subtotal ?? 0,
          shipping_cents: 0,
          tax_cents: session.total_details?.amount_tax ?? 0,
          total_cents: session.amount_total ?? 0,
          currency: (session.currency ?? "cad").toUpperCase(),
          notes: null,
          source: "api",
          external_order_id: session.id,
        })
        .select("id")
        .single<{ id: string }>();

      if (legacyOrderError || !legacyOrder) throw legacyOrderError;
      orderId = legacyOrder.id;
    } else {
      throw orderError;
    }
  } else if (order) {
    orderId = order.id;
  }

  if (!orderId) {
    throw new Error(`Stripe session ${session.id} did not create an order id.`);
  }

  const fallbackProductType = session.metadata?.product_type ?? "custom";
  const fallbackProductId = session.metadata?.product_id ?? fallbackProductType;
  const fallbackProductName = session.metadata?.product_name ?? "Custom PRNTD Product";
  const customization = parseMetadataJson(session.metadata?.customization);
  const pricingContext = parseMetadataJson(session.metadata?.pricing_context);
  const uploadIds = parseMetadataArray(session.metadata?.upload_ids);
  const designReferences = parseMetadataArray(session.metadata?.design_references);

  const items = lineItems.data.map((item) => {
    const priceId = typeof item.price === "string" ? item.price : item.price?.id ?? "";
    const product = getStripeCheckoutProductByPrice(priceId);
    const quantity = item.quantity ?? (Number(session.metadata?.quantity ?? 1) || 1);
    const lineTotal = item.amount_total ?? item.amount_subtotal ?? 0;

    return {
      order_id: orderId,
      product_id: product?.fulfillmentProductId ?? fallbackProductId,
      product_name: item.description || product?.label || fallbackProductName,
      sku: priceId || null,
      quantity,
      unit_price_cents: quantity > 0 ? Math.round(lineTotal / quantity) : lineTotal,
      line_total_cents: lineTotal,
      customization: {
        product_type: product?.type ?? fallbackProductType,
        stripe_price_id: priceId,
        pricing_context: pricingContext,
        uploads: uploadIds,
        designs: designReferences,
        ...customization,
      },
    };
  });

  if (items.length) {
    const { error: itemError } = await supabase.from("order_items").insert(items);
    if (itemError) throw itemError;
  }

  const { error: statusError } = await supabase.from("production_status_history").insert({
    order_id: orderId,
    status: "pending",
    notes: "Stripe payment confirmed. Order finalized.",
    changed_by: "stripe",
  });

  if (statusError) throw statusError;

  await attachUploadsToOrder(orderId, uploadIds, designReferences);
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
    const shouldProcess = await registerStripeEvent(event);
    if (!shouldProcess) {
      return Response.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await updateCustomerSubscription(event.data.object as Stripe.Subscription, event.id);
        break;
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, event.id);
        break;
      default:
        break;
    }

    await markStripeEventProcessed(event.id);

    return Response.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handling failed:", error);
    return Response.json({ error: "Webhook handling failed" }, { status: 500 });
  }
}
