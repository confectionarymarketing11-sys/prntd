/* eslint-disable */
// @ts-nocheck
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  {
    apiVersion: "2025-03-31.basil"
  }
);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/*
========================
PLAN CONFIG
========================
*/

const PLAN_CONFIG: Record<string, any> = {

  "price_starter_here": {
    credits: 15,
    plan: "starter",
    max_qr_limit: 1
  },

  "price_pro_here": {
    credits: 40,
    plan: "pro",
    max_qr_limit: 5
  },

  "price_business_here": {
    credits: 85,
    plan: "business",
    max_qr_limit: 10
  }
};

function getPlan(priceId: string) {

  return (
    PLAN_CONFIG[priceId] ||
    PLAN_CONFIG["price_starter_here"]
  );
}

/*
========================
TRIAL CREDIT CONFIG
========================
*/

const TRIAL_CREDITS = 10;

/*
========================
MAIN ACTION
========================
*/

export async function action({ request }: any) {

  const sig =
    request.headers.get(
      "stripe-signature"
    );

  const rawBody =
    await request.text();

  let event: Stripe.Event;

  try {

    event =
      stripe.webhooks.constructEvent(
        rawBody,
        sig!,
        process.env
          .STRIPE_WEBHOOK_SECRET!
      );

  } catch {

    return new Response(
      "Invalid signature",
      { status: 400 }
    );
  }

  /*
  ========================
  INVOICE PAYMENT SUCCESS
  ========================
  */

  if (
    event.type ===
    "invoice.payment_succeeded"
  ) {

    const invoice = event.data.object as Stripe.Invoice;

    const customer =
      await stripe.customers.retrieve(
        invoice.customer as string
      );

    if (
      "deleted" in customer ||
      !customer.email
    ) {

      return new Response(
        "No email",
        { status: 400 }
      );
    }

    const email =
      customer.email
        .toLowerCase()
        .trim();

    /*
    ========================
    LOAD EXISTING USER
    ========================
    */

    const {
      data: existingUser
    } = await supabase
      .from("bg_users")
      .select(`
        trial_used,
        credits,
        subscription_credits
      `)
      .eq("email", email)
      .maybeSingle();

    /*
    ========================
    PLAN LOOKUP
    ========================
    */

    const priceId =
      invoice.lines.data[0]
      ?.price?.id || "";

    const plan =
      getPlan(priceId);

    /*
    ========================
    DETECT TRIAL
    ========================
    */

    const isTrial =
      invoice.billing_reason ===
      "subscription_create";

    /*
    ========================
    CREDIT DECISION
    ========================
    */

    let creditsToGive =
      plan.credits;

    let trialUsed =
      existingUser?.trial_used ||
      false;

    /*
    FIRST TRIAL ONLY
    */

    if (
      isTrial &&
      !trialUsed
    ) {

      creditsToGive =
        TRIAL_CREDITS;

      trialUsed = true;
    }

    /*
    ========================
    RENEWAL DATE
    ========================
    */

    const renewalDate =
      new Date();

    renewalDate.setDate(
      renewalDate.getDate() + 30
    );

    /*
    ========================
    UPSERT USER
    ========================
    */

    await supabase
      .from("bg_users")
      .upsert(
        {
          email,

          /*
          SUBSCRIPTION STATE
          */

          subscription_active:
            true,

          plan_type:
            plan.plan,

          max_qr_limit:
            plan.max_qr_limit,

          renewal_date:
            renewalDate.toISOString(),

          last_payment_date:
            new Date().toISOString(),

          payment_status:
            "paid",

          /*
          CREDIT MODEL
          */

          subscription_credits:
            creditsToGive,

          /*
          TRIAL TRACKING
          */

          trial_used:
            trialUsed,

          /*
          IMPORTANT:
          DO NOT TOUCH
          PURCHASED CREDITS
          */
        },

        {
          onConflict:
            "email"
        }
      );
  }

  /*
  ========================
  CANCEL SUBSCRIPTION
  ========================
  */

  if (
    event.type ===
    "customer.subscription.deleted"
  ) {

    const sub = event.data.object as Stripe.Subscription;

    const customer =
      await stripe.customers.retrieve(
        sub.customer as string
      );

    if (
      !("deleted" in customer) &&
      customer.email
    ) {

      /*
      IMPORTANT:
      DO NOT REMOVE
      SUB CREDITS HERE.

      User keeps access until
      renewal date expires.
      */

      await supabase
        .from("bg_users")
        .update({

          subscription_active:
            false,

          payment_status:
            "cancelled"
        })
        .eq(
          "email",
          customer.email
            .toLowerCase()
            .trim()
        );
    }
  }

  /*
  ========================
  SUCCESS
  ========================
  */

  return new Response(
    JSON.stringify({
      received: true
    }),
    {
      status: 200
    }
  );
}
