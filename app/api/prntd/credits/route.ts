import { apiJson, withApiErrorHandling } from "@/lib/api-response";
import { requirePrntdEmail } from "@/lib/auth/jwt";
import { corsPreflight } from "@/lib/cors";
import { checkRequestRateLimit } from "@/lib/rate-limit";
import { assertTrustedOrigin } from "@/lib/security";
import { createSupabaseAdminClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CustomerCreditRow = {
  id: string;
  credits_balance: number | null;
  has_received_free_credits?: boolean | null;
  free_credits_granted_at?: string | null;
  subscription_status: string | null;
  plan_tier: string | null;
};

type BgCreditRow = {
  credits: number | null;
  subscription_credits: number | null;
};

const customerCreditColumns =
  "id, credits_balance, has_received_free_credits, free_credits_granted_at, subscription_status, plan_tier";

async function loadBgCredits(supabase: ReturnType<typeof createSupabaseAdminClient>, email: string) {
  const { data, error } = await supabase
    .from("bg_users")
    .select("credits, subscription_credits")
    .eq("email", email)
    .maybeSingle<BgCreditRow>();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return {
    credits: Number(data?.credits ?? 0),
    subscriptionCredits: Number(data?.subscription_credits ?? 0),
  };
}

async function ensureCustomerCredits(supabase: ReturnType<typeof createSupabaseAdminClient>, email: string) {
  const { data: existing, error } = await supabase
    .from("customers")
    .select(customerCreditColumns)
    .eq("email", email)
    .maybeSingle<CustomerCreditRow>();

  if (error && (error.code === "42703" || error.message?.includes("has_received_free_credits"))) {
    const legacy = await supabase
      .from("customers")
      .select("id, credits_balance, subscription_status, plan_tier")
      .eq("email", email)
      .maybeSingle<CustomerCreditRow>();

    if (legacy.error && legacy.error.code !== "PGRST116") {
      throw legacy.error;
    }

    if (legacy.data) {
      return legacy.data;
    }

    const created = await supabase
      .from("customers")
      .insert({
        email,
        credits_balance: 3,
        updated_at: new Date().toISOString(),
      })
      .select("id, credits_balance, subscription_status, plan_tier")
      .single<CustomerCreditRow>();

    if (created.error) {
      throw created.error;
    }

    return created.data;
  }

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  if (existing) {
    const hasReceived = existing.has_received_free_credits ?? false;

    if (hasReceived) {
      return existing;
    }

    const nextCredits = Number(existing.credits_balance ?? 0) + 3;
    const now = new Date().toISOString();
    const { data: updated, error: updateError } = await supabase
      .from("customers")
      .update({
        credits_balance: nextCredits,
        has_received_free_credits: true,
        free_credits_granted_at: now,
        updated_at: now,
      })
      .eq("id", existing.id)
      .eq("has_received_free_credits", false)
      .select(customerCreditColumns)
      .maybeSingle<CustomerCreditRow>();

    if (!updateError && updated) {
      return updated;
    }

    return {
      ...existing,
      credits_balance: nextCredits,
      has_received_free_credits: true,
      free_credits_granted_at: now,
    };
  }

  const now = new Date().toISOString();
  const { data: created, error: insertError } = await supabase
    .from("customers")
    .insert({
      email,
      credits_balance: 3,
      has_received_free_credits: true,
      free_credits_granted_at: now,
      updated_at: now,
    })
    .select(customerCreditColumns)
    .single<CustomerCreditRow>();

  if (insertError) {
    throw insertError;
  }

  return created;
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
    const [customer, bg] = await Promise.all([ensureCustomerCredits(supabase, email), loadBgCredits(supabase, email)]);
    const customerCredits = Number(customer.credits_balance ?? 0);
    const legacyCredits = bg.credits;
    const subscriptionCredits = bg.subscriptionCredits;

    return apiJson(request, {
      success: true,
      credits: customerCredits + legacyCredits,
      subscription_credits: subscriptionCredits,
      total_credits: customerCredits + legacyCredits + subscriptionCredits,
      customer_credits: customerCredits,
      legacy_credits: legacyCredits,
      subscription_status: customer.subscription_status ?? "inactive",
      plan_tier: customer.plan_tier ?? "none",
      has_received_free_credits: customer.has_received_free_credits ?? false,
      source: "customers+bg_users",
    });
  });
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request, "GET, OPTIONS");
}
