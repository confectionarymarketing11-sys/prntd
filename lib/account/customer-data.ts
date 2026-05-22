import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/admin";

export type AccountOrder = {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string | null;
  production_status: string;
  payment_status: string;
  total_cents: number;
  currency: string;
  created_at: string;
  order_items?: {
    id: string;
    product_name: string;
    quantity: number;
    line_total_cents: number;
    customization: Record<string, unknown>;
  }[];
  shipments?: {
    id: string;
    tracking_number: string | null;
    tracking_url: string | null;
    shipment_status: string;
  }[];
};

export type AccountDesign = {
  url: string;
  path: string;
  created_at?: string;
  prompt?: string;
  product_type?: string;
  design_type?: string;
};

export type AccountCustomerProfile = {
  id: string;
  email: string;
  name: string | null;
  stripe_customer_id: string | null;
  shopify_customer_id: string | null;
  credits_balance: number;
  subscription_status: string;
  plan_tier: string;
  stripe_subscription_id: string | null;
  subscription_current_period_end: string | null;
};

type DesignRow = {
  data?: {
    path?: string;
    prompt?: string;
    product_type?: string;
    type?: string;
  } | null;
  created_at?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function formatAccountMoney(cents: number, currency = "CAD") {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format((cents || 0) / 100);
}

export async function fetchCustomerOrders(email: string) {
  if (!hasSupabaseAdminConfig()) return [];

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      customer_email,
      customer_name,
      production_status,
      payment_status,
      total_cents,
      currency,
      created_at,
      order_items (
        id,
        product_name,
        quantity,
        line_total_cents,
        customization
      ),
      shipments (
        id,
        tracking_number,
        tracking_url,
        shipment_status
      )
    `
    )
    .eq("customer_email", normalizeEmail(email))
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return data as AccountOrder[];
}

export async function fetchCustomerProfile(email: string): Promise<AccountCustomerProfile | null> {
  if (!hasSupabaseAdminConfig()) return null;

  const supabase = createSupabaseAdminClient();
  const normalizedEmail = normalizeEmail(email);
  const evolved = await supabase
    .from("customers")
    .select(
      "id, email, name, stripe_customer_id, shopify_customer_id, credits_balance, subscription_status, plan_tier, stripe_subscription_id, subscription_current_period_end"
    )
    .eq("email", normalizedEmail)
    .maybeSingle<AccountCustomerProfile>();

  if (!evolved.error && evolved.data) {
    return {
      ...evolved.data,
      credits_balance: Number(evolved.data.credits_balance ?? 0),
      subscription_status: evolved.data.subscription_status ?? "inactive",
      plan_tier: evolved.data.plan_tier ?? "none",
    };
  }

  const legacy = await supabase
    .from("customers")
    .select("id, email, name")
    .eq("email", normalizedEmail)
    .maybeSingle<{ id: string; email: string; name: string | null }>();

  if (legacy.error || !legacy.data) return null;

  return {
    ...legacy.data,
    stripe_customer_id: null,
    shopify_customer_id: null,
    credits_balance: 0,
    subscription_status: "inactive",
    plan_tier: "none",
    stripe_subscription_id: null,
    subscription_current_period_end: null,
  };
}

export async function fetchCustomerDesigns(email: string) {
  if (!hasSupabaseAdminConfig()) return [];

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("designs")
    .select("data, created_at")
    .eq("user_id", normalizeEmail(email))
    .order("created_at", { ascending: false })
    .limit(60);

  if (error || !data) return [];

  const designs = await Promise.all(
    (data as DesignRow[]).map(async (design) => {
      const path = design.data?.path;
      if (!path) return null;

      const { data: signed, error: signedError } = await supabase.storage.from("uploads").createSignedUrl(path, 60 * 60);
      if (signedError || !signed?.signedUrl) return null;

      return {
        url: signed.signedUrl,
        path,
        created_at: design.created_at,
        prompt: design.data?.prompt ?? "",
        product_type: design.data?.product_type ?? "",
        design_type: design.data?.type ?? "",
      } satisfies AccountDesign;
    })
  );

  return designs.filter(Boolean) as AccountDesign[];
}
