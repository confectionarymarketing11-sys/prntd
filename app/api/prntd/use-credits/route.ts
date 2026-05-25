import { z } from "zod";
import { ApiError, apiJson, withApiErrorHandling } from "@/lib/api-response";
import { requirePrntdEmail } from "@/lib/auth/jwt";
import { corsPreflight } from "@/lib/cors";
import { checkRequestRateLimit } from "@/lib/rate-limit";
import { assertJsonContentType, assertTrustedOrigin } from "@/lib/security";
import { createSupabaseAdminClient } from "@/lib/supabase/service";
import {
  activeTrialCredits,
  clearExpiredTrialCredits,
  selectBgCredits,
  updateBgCredits,
} from "@/lib/bg-credits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  amount: z.coerce.number().int().positive().max(100),
});

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
    const selected = await selectBgCredits(supabase, email);
    const user = selected.data ? await clearExpiredTrialCredits(supabase, email) : null;

    if (!user) {
      throw new ApiError("User not found", 404, "user_not_found");
    }

    const purchased = Number(user.credits ?? 0);
    const subscriptionCredits = Number(user.subscription_credits ?? 0);
    const trialCredits = activeTrialCredits(user);
    const availableCredits = purchased + subscriptionCredits + trialCredits;

    if (availableCredits < amount) {
      throw new ApiError("Not enough credits", 400, "insufficient_credits");
    }

    let remaining = amount;
    const trialUsed = Math.min(trialCredits, remaining);
    remaining -= trialUsed;

    const subscriptionUsed = Math.min(subscriptionCredits, remaining);
    remaining -= subscriptionUsed;

    const purchasedUsed = Math.min(purchased, remaining);
    const nextTrialCredits = trialCredits - trialUsed;
    const nextSubscriptionCredits = subscriptionCredits - subscriptionUsed;
    const nextPurchasedCredits = purchased - purchasedUsed;
    const nextTotalCredits = nextPurchasedCredits + nextSubscriptionCredits + nextTrialCredits;

    const updated = await updateBgCredits({
      supabase,
      email,
      previous: {
        credits: purchased,
        subscriptionCredits,
        trialCredits: Number(user.trial_credits ?? 0),
      },
      next: {
        credits: nextPurchasedCredits,
        subscriptionCredits: nextSubscriptionCredits,
        trialCredits: nextTrialCredits,
        trialCreditsExpiresAt: nextTrialCredits ? user.trial_credits_expires_at ?? null : null,
      },
      columns: {
        hasTotalColumn: selected.hasTotalColumn,
        hasTrialColumns: selected.hasTrialColumns,
      },
    });

    if (!updated) {
      throw new ApiError("Conflict, retry request", 409, "credit_conflict");
    }

    return apiJson(request, {
      success: true,
      credits: nextPurchasedCredits,
      subscription_credits: nextSubscriptionCredits,
      trial_credits: nextTrialCredits,
      trial_credits_expires_at: nextTrialCredits ? user.trial_credits_expires_at ?? null : null,
      total_credits: nextTotalCredits,
      source: selected.hasTotalColumn ? "bg_users.total_credits" : "bg_users.computed",
    });
  });
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request, "POST, OPTIONS");
}
