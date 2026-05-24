import { z } from "zod";
import { ApiError, apiJson, withApiErrorHandling } from "@/lib/api-response";
import { requirePrntdEmail } from "@/lib/auth/jwt";
import { corsPreflight } from "@/lib/cors";
import { recordCreditTransaction } from "@/lib/credits";
import { checkRequestRateLimit } from "@/lib/rate-limit";
import { assertJsonContentType, assertTrustedOrigin } from "@/lib/security";
import { createSupabaseAdminClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  amount: z.coerce.number().int().positive().max(100),
});

type CustomerCreditRow = {
  id: string;
  auth_user_id: string | null;
  credits_balance: number | null;
  has_received_free_credits?: boolean | null;
};

type BgCreditRow = {
  credits: number | null;
  subscription_credits: number | null;
};

export async function POST(request: Request) {
  return withApiErrorHandling(request, async () => {
    assertTrustedOrigin(request);
    assertJsonContentType(request);
    checkRequestRateLimit(request, "prntd-use-credits:ip", { limit: 30, windowMs: 60_000 });

    const email = requirePrntdEmail(request);
    checkRequestRateLimit(request, "prntd-use-credits:email", {
      identifier: email,
      limit: 60,
      windowMs: 10 * 60_000,
    });

    const { amount } = bodySchema.parse(await request.json());
    const supabase = createSupabaseAdminClient();
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id, auth_user_id, credits_balance, has_received_free_credits")
      .eq("email", email)
      .maybeSingle<CustomerCreditRow>();

    let activeCustomer = customer;
    let freeCreditTrackingAvailable = true;

    if (customerError && (customerError.code === "42703" || customerError.message?.includes("has_received_free_credits"))) {
      freeCreditTrackingAvailable = false;
      const legacy = await supabase
        .from("customers")
        .select("id, auth_user_id, credits_balance")
        .eq("email", email)
        .maybeSingle<CustomerCreditRow>();

      if (legacy.error && legacy.error.code !== "PGRST116") {
        throw legacy.error;
      }

      activeCustomer = legacy.data ?? null;
    } else if (customerError && customerError.code !== "PGRST116") {
      throw customerError;
    }

    const { data: user, error } = await supabase
      .from("bg_users")
      .select("credits, subscription_credits")
      .eq("email", email)
      .maybeSingle<BgCreditRow>();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    let customerCredits = Number(activeCustomer?.credits_balance ?? 0);

    if (activeCustomer && freeCreditTrackingAvailable && !activeCustomer.has_received_free_credits) {
      customerCredits += 3;
    }

    const purchased = Number(user?.credits || 0);
    const subscriptionCredits = Number(user?.subscription_credits || 0);

    if (customerCredits + subscriptionCredits + purchased < amount) {
      throw new ApiError("Not enough credits", 400, "insufficient_credits");
    }

    let remaining = amount;
    const customerUsed = Math.min(customerCredits, remaining);
    remaining -= customerUsed;

    const subscriptionUsed = Math.min(subscriptionCredits, remaining);
    remaining -= subscriptionUsed;

    const purchasedUsed = Math.min(purchased, remaining);
    const nextCustomerCredits = customerCredits - customerUsed;
    const newSubscriptionCredits = subscriptionCredits - subscriptionUsed;
    const newPurchasedCredits = purchased - purchasedUsed;

    if (activeCustomer && customerUsed > 0) {
      const updatePayload: Record<string, unknown> = {
        credits_balance: nextCustomerCredits,
        updated_at: new Date().toISOString(),
      };

      if (freeCreditTrackingAvailable && !activeCustomer.has_received_free_credits) {
        updatePayload.has_received_free_credits = true;
        updatePayload.free_credits_granted_at = new Date().toISOString();
      }

      const { data: updated, error: updateCustomerError } = await supabase
        .from("customers")
        .update(updatePayload)
        .eq("id", activeCustomer.id)
        .select("id")
        .maybeSingle<{ id: string }>();

      if (updateCustomerError || !updated) {
        throw new ApiError("Conflict, retry request", 409, "credit_conflict");
      }

      await recordCreditTransaction({
        customerId: activeCustomer.id,
        authUserId: activeCustomer.auth_user_id,
        amount: -customerUsed,
        reason: "usage",
        source: "prntd_api",
        metadata: {
          endpoint: "use-credits",
        },
      });
    }

    if ((subscriptionUsed > 0 || purchasedUsed > 0) && user) {
      const { data: updated, error: updateError } = await supabase
        .from("bg_users")
        .update({
          credits: newPurchasedCredits,
          subscription_credits: newSubscriptionCredits,
        })
        .eq("email", email)
        .eq("credits", purchased)
        .eq("subscription_credits", subscriptionCredits)
        .select("email")
        .maybeSingle<{ email: string }>();

      if (updateError || !updated) {
        throw new ApiError("Conflict, retry request", 409, "credit_conflict");
      }
    }

    return apiJson(request, {
      success: true,
      credits: nextCustomerCredits + newPurchasedCredits,
      subscription_credits: newSubscriptionCredits,
      total_credits: nextCustomerCredits + newPurchasedCredits + newSubscriptionCredits,
      customer_credits: nextCustomerCredits,
      legacy_credits: newPurchasedCredits,
      source: "customers+bg_users",
    });
  });
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request, "POST, OPTIONS");
}
