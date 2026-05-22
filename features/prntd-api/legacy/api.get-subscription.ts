/* eslint-disable */
// @ts-nocheck
import { createClient } from "@supabase/supabase-js";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "https://www.prntd.ca",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function loader({ request }: any) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: CORS_HEADERS
    });
  }

  if (request.method !== "GET") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed"
      }),
      {
        status: 405,
        headers: CORS_HEADERS
      }
    );
  }

  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return new Response(
        JSON.stringify({
          error: "Email is required"
        }),
        {
          status: 400,
          headers: CORS_HEADERS
        }
      );
    }

    /*
    LOAD USER FROM SUPABASE
    */

    let {
      data: user,
      error: userError
    } = await supabase
      .from("bg_users")
      .select(`
        email,
        subscription_active,
        plan_type,
        max_qr_limit,
        renewal_date,
        last_payment_date,
        payment_status
      `)
      .eq("email", email)
      .maybeSingle();

    if (userError) {
      console.error("Subscription Lookup Error:", userError);

      return new Response(
        JSON.stringify({
          error: "Failed to load subscription"
        }),
        {
          status: 500,
          headers: CORS_HEADERS
        }
      );
    }

    /*
    AUTO CREATE USER IF NOT FOUND
    NEW USERS START WITH NO ACTIVE PLAN
    */

    if (!user) {
      console.log("Creating new user for:", email);

      const {
        data: newUser,
        error: insertError
      } = await supabase
        .from("bg_users")
        .insert([
          {
            email,
            subscription_active: false,
            plan_type: "none",
            max_qr_limit: 0,
            payment_status: "unpaid",
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error("User Creation Error:", insertError);

        return new Response(
          JSON.stringify({
            error: "Failed to create customer account"
          }),
          {
            status: 500,
            headers: CORS_HEADERS
          }
        );
      }

      user = newUser;
    }

    /*
    AUTO CHECK IF RENEWAL EXPIRED
    */

    let subscriptionActive =
      user.subscription_active === true;

    if (user.renewal_date) {
      const renewalDate = new Date(user.renewal_date);
      const today = new Date();

      if (today > renewalDate) {

  subscriptionActive = false;

  await supabase
    .from("bg_users")
    .update({

      subscription_active: false,

      payment_status: "expired",

      subscription_credits: 0

    })
    .eq("email", email);
}
    }

    /*
    COUNT ACTIVE QR LINKS
    */

    const {
      count: currentQrCount,
      error: countError
    } = await supabase
      .from("qr_links")
      .select("id", {
        count: "exact",
        head: true
      })
      .eq("customer_email", email)
      .eq("active", true);

    if (countError) {
      console.error("QR Count Error:", countError);

      return new Response(
        JSON.stringify({
          error: "Failed to load QR usage"
        }),
        {
          status: 500,
          headers: CORS_HEADERS
        }
      );
    }

    const activeQrCount =
      Number(currentQrCount || 0);

    const maxQrLimit =
      Number(user.max_qr_limit || 0);

    const remainingSlots =
      Math.max(
        maxQrLimit - activeQrCount,
        0
      );

    /*
    SUCCESS RESPONSE
    */

    return new Response(
      JSON.stringify({
        success: true,

        subscription_active:
          subscriptionActive,

        plan_type:
          user.plan_type || "none",

        payment_status:
          user.payment_status || "unpaid",

        active_qr_count:
          activeQrCount,

        max_qr_limit:
          maxQrLimit,

        remaining_slots:
          remainingSlots,

        renewal_date:
          user.renewal_date || null,

        last_payment_date:
          user.last_payment_date || null
      }),
      {
        status: 200,
        headers: CORS_HEADERS
      }
    );

  } catch (err: any) {
    console.error(
      "Get Subscription Error:",
      err
    );

    return new Response(
      JSON.stringify({
        error:
          err.message ||
          "Server error"
      }),
      {
        status: 500,
        headers: CORS_HEADERS
      }
    );
  }
}