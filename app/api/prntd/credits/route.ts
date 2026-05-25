import { apiJson, withApiErrorHandling } from "@/lib/api-response";
import { requirePrntdEmail } from "@/lib/auth/jwt";
import { corsPreflight } from "@/lib/cors";
import { checkRequestRateLimit } from "@/lib/rate-limit";
import { assertTrustedOrigin } from "@/lib/security";
import { createSupabaseAdminClient } from "@/lib/supabase/service";
import {
  clearExpiredTrialCredits,
  createBgUserCredits,
  selectBgCredits,
  toCreditSnapshot,
} from "@/lib/bg-credits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return withApiErrorHandling(request, async () => {
    assertTrustedOrigin(request);
    checkRequestRateLimit(request, "prntd-credits:ip", { limit: 60, windowMs: 60_000 });

    const email = requirePrntdEmail(request);
    checkRequestRateLimit(request, "prntd-credits:email", {
      identifier: email,
      limit: 120,
      windowMs: 10 * 60_000,
    });

    const supabase = createSupabaseAdminClient();
    const selected = await selectBgCredits(supabase, email);
    const row =
      selected.data ??
      (await createBgUserCredits(supabase, email, {
        hasTotalColumn: selected.hasTotalColumn,
        hasTrialColumns: selected.hasTrialColumns,
      }));
    const currentRow = selected.data ? await clearExpiredTrialCredits(supabase, email) : row;
    const snapshot = toCreditSnapshot(row);
    const currentSnapshot = toCreditSnapshot(currentRow);

    return apiJson(request, {
      success: true,
      credits: currentSnapshot.credits,
      subscription_credits: currentSnapshot.subscriptionCredits,
      trial_credits: currentSnapshot.trialCredits,
      trial_credits_expires_at: currentSnapshot.trialCreditsExpiresAt,
      total_credits: currentSnapshot.totalCredits,
      source: snapshot.source,
    });
  });
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request, "GET, OPTIONS");
}
