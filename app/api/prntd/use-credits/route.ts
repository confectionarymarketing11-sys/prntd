import { z } from "zod";
import { ApiError, apiJson, withApiErrorHandling } from "@/lib/api-response";
import { requirePrntdEmail } from "@/lib/auth/jwt";
import { corsPreflight } from "@/lib/cors";
import { checkRequestRateLimit } from "@/lib/rate-limit";
import { assertJsonContentType, assertTrustedOrigin } from "@/lib/security";
import { createSupabaseAdminClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  amount: z.coerce.number().int().positive().max(100),
});

type BgCreditRow = {
  credits: number | null;
  subscription_credits: number | null;
  total_credits?: number | null;
};

async function selectBgCredits(supabase: ReturnType<typeof createSupabaseAdminClient>, email: string) {
  const withTotal = await supabase
    .from("bg_users")
    .select("credits, subscription_credits, total_credits")
    .eq("email", email)
    .maybeSingle<BgCreditRow>();

  if (!withTotal.error || withTotal.error.code === "PGRST116") {
    return { data: withTotal.data, hasTotalColumn: true };
  }

  if (withTotal.error.code !== "42703" && !withTotal.error.message?.includes("total_credits")) {
    throw withTotal.error;
  }

  const fallback = await supabase
    .from("bg_users")
    .select("credits, subscription_credits")
    .eq("email", email)
    .maybeSingle<BgCreditRow>();

  if (fallback.error && fallback.error.code !== "PGRST116") {
    throw fallback.error;
  }

  return { data: fallback.data, hasTotalColumn: false };
}

async function updateBgCredits({
  supabase,
  email,
  previousPurchased,
  previousSubscription,
  purchased,
  subscriptionCredits,
  hasTotalColumn,
}: {
  supabase: ReturnType<typeof createSupabaseAdminClient>;
  email: string;
  previousPurchased: number;
  previousSubscription: number;
  purchased: number;
  subscriptionCredits: number;
  hasTotalColumn: boolean;
}) {
  const payload: Record<string, unknown> = {
    credits: purchased,
    subscription_credits: subscriptionCredits,
  };

  if (hasTotalColumn) {
    payload.total_credits = purchased + subscriptionCredits;
  }

  const update = await supabase
    .from("bg_users")
    .update(payload)
    .eq("email", email)
    .eq("credits", previousPurchased)
    .eq("subscription_credits", previousSubscription)
    .select("email")
    .maybeSingle<{ email: string }>();

  if (!update.error) {
    return update.data;
  }

  if (!hasTotalColumn || (update.error.code !== "42703" && !update.error.message?.includes("total_credits"))) {
    throw update.error;
  }

  return updateBgCredits({
    supabase,
    email,
    previousPurchased,
    previousSubscription,
    purchased,
    subscriptionCredits,
    hasTotalColumn: false,
  });
}

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
    const { data: user, hasTotalColumn } = await selectBgCredits(supabase, email);

    if (!user) {
      throw new ApiError("User not found", 404, "user_not_found");
    }

    const purchased = Number(user.credits ?? 0);
    const subscriptionCredits = Number(user.subscription_credits ?? 0);
    const availableCredits = purchased + subscriptionCredits;

    if (availableCredits < amount) {
      throw new ApiError("Not enough credits", 400, "insufficient_credits");
    }

    let remaining = amount;
    const subscriptionUsed = Math.min(subscriptionCredits, remaining);
    remaining -= subscriptionUsed;

    const purchasedUsed = Math.min(purchased, remaining);
    const nextSubscriptionCredits = subscriptionCredits - subscriptionUsed;
    const nextPurchasedCredits = purchased - purchasedUsed;
    const nextTotalCredits = nextPurchasedCredits + nextSubscriptionCredits;

    const updated = await updateBgCredits({
      supabase,
      email,
      previousPurchased: purchased,
      previousSubscription: subscriptionCredits,
      purchased: nextPurchasedCredits,
      subscriptionCredits: nextSubscriptionCredits,
      hasTotalColumn,
    });

    if (!updated) {
      throw new ApiError("Conflict, retry request", 409, "credit_conflict");
    }

    return apiJson(request, {
      success: true,
      credits: nextPurchasedCredits,
      subscription_credits: nextSubscriptionCredits,
      total_credits: nextTotalCredits,
      source: hasTotalColumn ? "bg_users.total_credits" : "bg_users.computed",
    });
  });
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request, "POST, OPTIONS");
}
