import { apiJson, withApiErrorHandling } from "@/lib/api-response";
import { requirePrntdEmail } from "@/lib/auth/jwt";
import { corsPreflight } from "@/lib/cors";
import { checkRequestRateLimit } from "@/lib/rate-limit";
import { assertTrustedOrigin } from "@/lib/security";
import { createSupabaseAdminClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BgCreditRow = {
  credits: number | null;
  subscription_credits: number | null;
  total_credits?: number | null;
};

type CreditSnapshot = {
  credits: number;
  subscriptionCredits: number;
  totalCredits: number;
  source: "bg_users.total_credits" | "bg_users.computed";
};

function toCreditSnapshot(row: BgCreditRow | null): CreditSnapshot {
  const credits = Number(row?.credits ?? 0);
  const subscriptionCredits = Number(row?.subscription_credits ?? 0);
  const storedTotal = row?.total_credits;

  if (storedTotal !== null && storedTotal !== undefined) {
    return {
      credits,
      subscriptionCredits,
      totalCredits: Number(storedTotal ?? 0),
      source: "bg_users.total_credits",
    };
  }

  return {
    credits,
    subscriptionCredits,
    totalCredits: credits + subscriptionCredits,
    source: "bg_users.computed",
  };
}

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

async function createBgUserCredits(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  email: string,
  hasTotalColumn: boolean,
) {
  const row: Record<string, unknown> = {
    email,
    credits: 3,
    subscription_credits: 0,
    has_received_free_credits: true,
  };

  if (hasTotalColumn) {
    row.total_credits = 3;
  }

  const created = await supabase
    .from("bg_users")
    .insert(row)
    .select(hasTotalColumn ? "credits, subscription_credits, total_credits" : "credits, subscription_credits")
    .single<BgCreditRow>();

  if (created.error) {
    throw created.error;
  }

  return created.data;
}

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
    const row = selected.data ?? (await createBgUserCredits(supabase, email, selected.hasTotalColumn));
    const snapshot = toCreditSnapshot(row);

    return apiJson(request, {
      success: true,
      credits: snapshot.credits,
      subscription_credits: snapshot.subscriptionCredits,
      total_credits: snapshot.totalCredits,
      source: snapshot.source,
    });
  });
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request, "GET, OPTIONS");
}
