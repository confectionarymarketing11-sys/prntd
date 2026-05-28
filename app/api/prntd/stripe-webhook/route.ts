import Stripe from "stripe";
import { getOrCreateCustomerForEmail, PlatformCustomer } from "@/lib/auth/customer";
import { recordCreditTransaction } from "@/lib/credits";
import { orderConfirmationTemplate, sendTransactionalEmail } from "@/lib/email";
import { recordDiscountRedemption } from "@/features/discounts/data/discounts";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";
import {
  creditTopUpPacks,
  getStripeCheckoutProductByPrice,
  inferSubscriptionTier,
  subscriptionCreditGrants,
  subscriptionQrLimits,
  trialCreditGrant,
} from "@/lib/stripe-products";
import { createSupabaseAdminClient } from "@/lib/supabase/service";
import {
  activeTrialCredits,
  selectBgCredits,
  toCreditSnapshot,
  updateBgCredits,
} from "@/lib/bg-credits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowTestWebhooks =
  process.env.PRNTD_ALLOW_TEST_WEBHOOKS === "true" ||
  process.env.NODE_ENV !== "production";

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

function parseMetadataString(value: string | undefined) {
  if (!value) return "";

  try {
    const parsed = JSON.parse(value) as unknown;
    return typeof parsed === "string" ? parsed : "";
  } catch {
    return value;
  }
}

function formatCurrency(cents: number, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency || "CAD",
  }).format(cents / 100);
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

function subscriptionTrialEnd(subscription: Stripe.Subscription) {
  const trialEnd = subscription.trial_end;
  return trialEnd ? new Date(trialEnd * 1000).toISOString() : null;
}

function subscriptionIsCurrentlyTrialing(subscription: Stripe.Subscription) {
  const trialEnd = subscriptionTrialEnd(subscription);
  if (!trialEnd) return false;

  return subscription.status === "trialing" && new Date(trialEnd).getTime() > Date.now();
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
    throw new Error("stripe_events table is missing; refusing to process Stripe webhook without idempotency.");
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

async function getCustomerFromStripeCustomer(stripeId: string, testMode = false) {
  const existing = await findCustomerByStripeCustomerId(stripeId);
  if (existing) return existing;

  const stripe = getStripe({ testMode });
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

  const customer = await getCustomerFromStripeCustomer(stripeId, !subscription.livemode);
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

  if (customer.email) {
    if (subscriptionIsCurrentlyTrialing(subscription)) {
      await grantTrialCredits({
        customer,
        subscription,
        eventId,
      });
    } else if (subscription.status === "canceled" || subscription.status === "incomplete_expired") {
      await clearTrialCredits(customer.email);
    } else {
      await clearExpiredTrialCreditsForEmail(customer.email);
    }
  }
}

async function loadBgCreditState(email: string) {
  const supabase = createSupabaseAdminClient();
  const selected = await selectBgCredits(supabase, email);

  return {
    supabase,
    selected,
    row: selected.data,
    snapshot: toCreditSnapshot(selected.data),
  };
}

async function grantTrialCredits({
  customer,
  subscription,
  eventId,
}: {
  customer: PlatformCustomer;
  subscription: Stripe.Subscription;
  eventId: string;
}) {
  if (!customer.email) return;

  const email = customer.email.toLowerCase().trim();
  const trialExpiresAt = subscriptionTrialEnd(subscription) ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { supabase, selected, row, snapshot } = await loadBgCreditState(email);

  if (!selected.hasTrialColumns) {
    console.warn("Trial credits require bg_users trial credit columns. Apply the latest Supabase migration.");
    return;
  }

  if (row?.trial_used) {
    return;
  }

  const { error: bgError } = await supabase.from("bg_users").upsert(
    {
      email,
      credits: snapshot.credits,
      subscription_credits: snapshot.subscriptionCredits,
      trial_credits: trialCreditGrant,
      trial_credits_expires_at: trialExpiresAt,
      trial_credits_granted_at: new Date().toISOString(),
      trial_stripe_subscription_id: subscription.id,
      trial_used: true,
      subscription_active: true,
      plan_type: inferPlanFromSubscription(subscription),
      payment_status: "trialing",
      max_qr_limit: subscriptionQrLimits[inferPlanFromSubscription(subscription)] ?? 0,
      ...(selected.hasTotalColumn ? { total_credits: snapshot.credits + snapshot.subscriptionCredits + trialCreditGrant } : {}),
    },
    {
      onConflict: "email",
    },
  );

  if (bgError) {
    throw bgError;
  }

  await recordCreditTransaction({
    customerId: customer.id,
    authUserId: customer.auth_user_id,
    amount: trialCreditGrant,
    reason: "subscription_grant",
    source: "stripe_trial",
    stripeEventId: eventId,
    metadata: {
      subscription_id: subscription.id,
      trial_credits: trialCreditGrant,
      trial_credits_expires_at: trialExpiresAt,
      trial_only: true,
    },
  });
}

async function clearTrialCredits(email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const { supabase, selected, row, snapshot } = await loadBgCreditState(normalizedEmail);

  if (!row || !selected.hasTrialColumns) return;

  await updateBgCredits({
    supabase,
    email: normalizedEmail,
    next: {
      credits: snapshot.credits,
      subscriptionCredits: snapshot.subscriptionCredits,
      trialCredits: 0,
      trialCreditsExpiresAt: null,
    },
    columns: {
      hasTotalColumn: selected.hasTotalColumn,
      hasTrialColumns: selected.hasTrialColumns,
    },
  });
}

async function clearExpiredTrialCreditsForEmail(email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const { supabase, selected, row, snapshot } = await loadBgCreditState(normalizedEmail);

  if (!row || !selected.hasTrialColumns || !Number(row.trial_credits ?? 0) || activeTrialCredits(row)) {
    return;
  }

  await updateBgCredits({
    supabase,
    email: normalizedEmail,
    next: {
      credits: snapshot.credits,
      subscriptionCredits: snapshot.subscriptionCredits,
      trialCredits: 0,
      trialCreditsExpiresAt: null,
    },
    columns: {
      hasTotalColumn: selected.hasTotalColumn,
      hasTrialColumns: selected.hasTrialColumns,
    },
  });
}

async function refreshBgSubscriptionCredits({
  email,
  planTier,
  subscription,
}: {
  email: string;
  planTier: string;
  subscription: Stripe.Subscription;
}) {
  const normalizedEmail = email.toLowerCase().trim();
  const grant = subscriptionCreditGrants[planTier] ?? 0;
  const { supabase, selected, row, snapshot } = await loadBgCreditState(normalizedEmail);
  const trialCredits = selected.hasTrialColumns ? activeTrialCredits(row) : 0;

  const { error: bgError } = await supabase.from("bg_users").upsert(
    {
      email: normalizedEmail,
      credits: snapshot.credits,
      subscription_credits: grant,
      ...(selected.hasTrialColumns
        ? {
            trial_credits: trialCredits,
            trial_credits_expires_at: trialCredits ? row?.trial_credits_expires_at ?? null : null,
          }
        : {}),
      subscription_active: true,
      plan_type: planTier,
      payment_status: "paid",
      last_payment_date: new Date().toISOString(),
      renewal_date: subscriptionPeriodEnd(subscription),
      max_qr_limit: subscriptionQrLimits[planTier] ?? 0,
      ...(selected.hasTotalColumn ? { total_credits: snapshot.credits + grant + trialCredits } : {}),
    },
    {
      onConflict: "email",
    },
  );

  if (bgError) {
    throw bgError;
  }
}

async function handleCreditTopUpCheckout(session: Stripe.Checkout.Session, eventId: string) {
  const customerEmail = session.customer_details?.email || session.customer_email || "";

  if (!customerEmail) {
    throw new Error(`Credit checkout session ${session.id} is missing customer email.`);
  }

  const email = customerEmail.toLowerCase().trim();
  const packId = session.metadata?.credit_pack ?? "";
  const pack = Object.values(creditTopUpPacks).find((candidate) => candidate.id === packId);
  const creditsToAdd = Number(session.metadata?.credit_amount ?? pack?.credits ?? 0);

  if (!creditsToAdd || creditsToAdd < 1) {
    throw new Error(`Credit checkout session ${session.id} has an invalid credit amount.`);
  }

  const stripeId = stripeCustomerId(session.customer) || session.metadata?.stripe_customer_id || null;
  const customer = await getOrCreateCustomerForEmail({
    email,
    authUserId: session.metadata?.auth_user_id || null,
    name: session.customer_details?.name ?? null,
    stripeCustomerId: stripeId,
  });

  const { supabase, selected, row, snapshot } = await loadBgCreditState(email);
  const trialCredits = selected.hasTrialColumns ? activeTrialCredits(row) : 0;
  const nextPurchasedCredits = snapshot.credits + creditsToAdd;

  const { error: bgError } = await supabase.from("bg_users").upsert(
    {
      email,
      credits: nextPurchasedCredits,
      subscription_credits: snapshot.subscriptionCredits,
      ...(selected.hasTrialColumns
        ? {
            trial_credits: trialCredits,
            trial_credits_expires_at: trialCredits ? row?.trial_credits_expires_at ?? null : null,
          }
        : {}),
      ...(selected.hasTotalColumn ? { total_credits: nextPurchasedCredits + snapshot.subscriptionCredits + trialCredits } : {}),
    },
    {
      onConflict: "email",
    },
  );

  if (bgError) {
    throw bgError;
  }

  await recordCreditTransaction({
    customerId: customer.id,
    authUserId: customer.auth_user_id,
    amount: creditsToAdd,
    reason: "top_up",
    source: "stripe_checkout",
    stripeEventId: eventId,
    metadata: {
      checkout_session_id: session.id,
      credit_pack: packId,
      amount_total: session.amount_total,
      currency: session.currency,
    },
  });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, eventId: string) {
  const stripeId = stripeCustomerId(invoice.customer);
  if (!stripeId) return;

  const customer = await getCustomerFromStripeCustomer(stripeId, !invoice.livemode);
  if (!customer) return;

  const subscriptionId = invoiceSubscriptionId(invoice);
  if (!subscriptionId) return;

  const subscription = await getStripe({ testMode: !invoice.livemode }).subscriptions.retrieve(subscriptionId);
  const planTier = inferPlanFromSubscription(subscription);
  const grant = subscriptionCreditGrants[planTier] ?? 0;

  if (subscriptionIsCurrentlyTrialing(subscription)) {
    await grantTrialCredits({
      customer,
      subscription,
      eventId,
    });
    return;
  }

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
    await refreshBgSubscriptionCredits({
      email: customer.email,
      planTier,
      subscription,
    });

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

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, eventId: string) {
  if (session.mode !== "payment") return;
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    console.warn(`Checkout session ${session.id} completed without paid status: ${session.payment_status}`);
    return;
  }

  const stripe = getStripe({ testMode: !session.livemode });
  const supabase = createSupabaseAdminClient();

  if (session.metadata?.product_type === "credits") {
    await handleCreditTopUpCheckout(session, eventId);
    return;
  }

  const orderNumber = `STRIPE-${session.id}`;

  const { data: existingOrder, error: existingError } = await supabase
    .from("orders")
    .select("id")
    .or(`order_number.eq.${orderNumber},external_order_id.eq.${session.id}`)
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
  const shippingCents = session.shipping_cost?.amount_total ?? Number(session.metadata?.shipping_cents ?? 0);
  const discountAmountCents = Number(session.metadata?.discount_amount_cents ?? 0);
  const shippingDiscountCents = Number(session.metadata?.shipping_discount_cents ?? 0);
  const currency = (session.currency ?? "cad").toUpperCase();
  const taxBreakdown = {
    automatic_tax: session.automatic_tax ?? null,
    total_details: session.total_details ?? null,
    shipping_cost: session.shipping_cost ?? null,
  };
  const orderNotes = parseMetadataString(session.metadata?.order_notes).trim() || null;
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
      discount_cents: discountAmountCents + shippingDiscountCents,
      shipping_cents: shippingCents,
      tax_cents: session.total_details?.amount_tax ?? 0,
      total_cents: session.amount_total ?? 0,
      tax_breakdown: taxBreakdown,
      shipping_method: session.metadata?.shipping_method ?? null,
      shipping_cost_cents: shippingCents,
      checkout_session_id: session.id,
      guest_checkout: !customer.auth_user_id,
      currency,
      notes: orderNotes,
      source: "storefront",
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
          shipping_cents: shippingCents,
          tax_cents: session.total_details?.amount_tax ?? 0,
          total_cents: session.amount_total ?? 0,
          currency,
          notes: orderNotes,
          source: "storefront",
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

const { data: pendingOrder } =
  await supabase
    .from("pending_checkouts")
    .select("order_payload")
    .eq(
      "order_id",
      session.metadata?.order_id,
    )
    .single();

if (!pendingOrder) {
  throw new Error(
    "Pending order not found.",
  );
}

const pendingCheckoutOrder =
  pendingOrder.order_payload;

const uploadIds =
  await uploadOrderPrintAssets(
    pendingCheckoutOrder,
  );

  const fallbackProductType = session.metadata?.product_type ?? "custom";
  const fallbackProductId = session.metadata?.product_id ?? fallbackProductType;
  const fallbackProductName = session.metadata?.product_name ?? "Custom PRNTD Product";
  const customization = parseMetadataJson(session.metadata?.customization);
  const pricingContext = parseMetadataJson(session.metadata?.pricing_context);
  
  const designReferences = parseMetadataArray(session.metadata?.design_references);
  const discountId = session.metadata?.discount_id || "";

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

await supabase
  .from("pending_checkouts")
  .update({
    status: "completed",
    completed_at:
      new Date().toISOString(),
  })
  .eq(
    "order_id",
    session.metadata?.order_id,
  );

  if (discountId && (discountAmountCents > 0 || shippingDiscountCents > 0)) {
    await recordDiscountRedemption({
      discountId,
      orderId,
      customerId: customer.id,
      customerEmail: email,
      code: session.metadata?.discount_code || null,
      discountAmountCents,
      shippingDiscountCents,
      currency: (session.currency ?? "cad").toUpperCase(),
      metadata: {
        stripe_session_id: session.id,
      },
    });
  }

  const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.prntd.ca"}/dashboard`;
  const confirmationEmail = orderConfirmationTemplate({
    orderNumber,
    customerName,
    total: formatCurrency(session.amount_total ?? 0, currency),
    portalUrl,
  });

  await sendTransactionalEmail({
    eventKey: `order-confirmation:${session.id}`,
    emailType: "order_confirmation",
    to: customerEmail,
    subject: confirmationEmail.subject,
    html: confirmationEmail.html,
    text: confirmationEmail.text,
    metadata: {
      order_id: orderId,
      stripe_session_id: session.id,
    },
  });

  const { error: emailStampError } = await supabase
    .from("orders")
    .update({ confirmation_email_sent_at: new Date().toISOString() })
    .eq("id", orderId);

  if (emailStampError && emailStampError.code !== "42703") {
    throw emailStampError;
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
    event = getStripe().webhooks.constructEvent(rawBody, signature, getStripeWebhookSecret());
  } catch {
    if (!allowTestWebhooks) {
      return new Response("Invalid signature", { status: 400 });
    }

    try {
      event = getStripe({ testMode: true }).webhooks.constructEvent(rawBody, signature, getStripeWebhookSecret({ testMode: true }));
    } catch {
      return new Response("Invalid signature", { status: 400 });
    }
  }

  if (!event.livemode && !allowTestWebhooks) {
    return new Response("Test webhooks are disabled", { status: 400 });
  }

  try {
    const shouldProcess = await registerStripeEvent(event);
    if (!shouldProcess) {
      return Response.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, event.id);
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
