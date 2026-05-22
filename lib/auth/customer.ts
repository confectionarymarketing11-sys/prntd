import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { ApiError } from "@/lib/api-response";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PlatformCustomer = {
  id: string;
  auth_user_id: string | null;
  email: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  stripe_customer_id: string | null;
  shopify_customer_id: string | null;
  credits_balance: number;
  has_received_free_credits: boolean;
  free_credits_granted_at: string | null;
  subscription_status: string;
  plan_tier: string;
  stripe_subscription_id: string | null;
  subscription_current_period_end: string | null;
};

export async function getCustomerUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeCustomer(row: Partial<PlatformCustomer> & { id: string; email: string }): PlatformCustomer {
  return {
    id: row.id,
    auth_user_id: row.auth_user_id ?? null,
    email: normalizeEmail(row.email),
    name: row.name ?? null,
    phone: row.phone ?? null,
    company: row.company ?? null,
    stripe_customer_id: row.stripe_customer_id ?? null,
    shopify_customer_id: row.shopify_customer_id ?? null,
    credits_balance: Number(row.credits_balance ?? 0),
    has_received_free_credits: row.has_received_free_credits ?? false,
    free_credits_granted_at: row.free_credits_granted_at ?? null,
    subscription_status: row.subscription_status ?? "inactive",
    plan_tier: row.plan_tier ?? "none",
    stripe_subscription_id: row.stripe_subscription_id ?? null,
    subscription_current_period_end: row.subscription_current_period_end ?? null,
  };
}

const customerSelectColumns =
  "id, auth_user_id, email, name, phone, company, stripe_customer_id, shopify_customer_id, credits_balance, has_received_free_credits, free_credits_granted_at, subscription_status, plan_tier, stripe_subscription_id, subscription_current_period_end";

async function grantInitialCreditsIfNeeded(customer: PlatformCustomer) {
  if (customer.has_received_free_credits) {
    return customer;
  }

  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const nextCredits = Number(customer.credits_balance ?? 0) + 3;
  const { data, error } = await supabase
    .from("customers")
    .update({
      credits_balance: nextCredits,
      has_received_free_credits: true,
      free_credits_granted_at: now,
      updated_at: now,
    })
    .eq("id", customer.id)
    .eq("has_received_free_credits", false)
    .select(customerSelectColumns)
    .maybeSingle<PlatformCustomer>();

  if (!error && data) {
    return normalizeCustomer(data);
  }

  const refreshed = await supabase
    .from("customers")
    .select(customerSelectColumns)
    .eq("id", customer.id)
    .maybeSingle<PlatformCustomer>();

  return refreshed.data ? normalizeCustomer(refreshed.data) : customer;
}

export async function getOrCreateCustomerForEmail({
  email,
  authUserId,
  name,
  stripeCustomerId,
}: {
  email: string;
  authUserId?: string | null;
  name?: string | null;
  stripeCustomerId?: string | null;
}) {
  if (!hasSupabaseAdminConfig()) {
    throw new ApiError("Supabase service role is not configured", 500, "supabase_not_configured");
  }

  const supabase = createSupabaseAdminClient();
  const normalizedEmail = normalizeEmail(email);
  const basePayload = {
    email: normalizedEmail,
    name: name ?? null,
    updated_at: new Date().toISOString(),
  };

  const evolvedPayload: Record<string, unknown> = {
    ...basePayload,
  };

  if (authUserId) evolvedPayload.auth_user_id = authUserId;
  if (stripeCustomerId) evolvedPayload.stripe_customer_id = stripeCustomerId;

  const evolved = await supabase
    .from("customers")
    .upsert(evolvedPayload, { onConflict: "email" })
    .select(customerSelectColumns)
    .single<PlatformCustomer>();

  if (!evolved.error && evolved.data) {
    return grantInitialCreditsIfNeeded(normalizeCustomer(evolved.data));
  }

  const legacy = await supabase
    .from("customers")
    .upsert(basePayload, { onConflict: "email" })
    .select("id, email, name, phone, company")
    .single<{ id: string; email: string; name: string | null; phone: string | null; company: string | null }>();

  if (legacy.error || !legacy.data) {
    throw legacy.error ?? evolved.error ?? new ApiError("Unable to load customer", 500, "customer_load_failed");
  }

  return normalizeCustomer(legacy.data);
}

export async function getCurrentCustomer() {
  const user = await getCustomerUser();

  if (!user?.email) {
    return null;
  }

  const customer = await getOrCreateCustomerForEmail({
    email: user.email,
    authUserId: user.id,
    name: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null,
  });

  return {
    user,
    customer,
  };
}

export async function requireCustomer() {
  const current = await getCurrentCustomer();

  if (!current) {
    throw new ApiError("Authentication required", 401, "authentication_required");
  }

  return current;
}

export async function requireCustomerUser() {
  const user = await getCustomerUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  return user;
}

export async function redirectIfCustomerLoggedIn() {
  const user = await getCustomerUser();

  if (user) {
    redirect("/dashboard");
  }
}
