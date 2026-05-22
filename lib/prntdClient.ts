import { getSupabaseBrowserClient } from "@/lib/supabase";

export type CreditsResponse = {
  success?: boolean;
  credits?: number;
  subscription_credits?: number;
  total_credits?: number;
  error?: string;
};

export type SubscriptionResponse = {
  success?: boolean;
  subscription_active?: boolean;
  plan_type?: string;
  payment_status?: string;
  active_qr_count?: number;
  max_qr_limit?: number;
  remaining_slots?: number;
  renewal_date?: string | null;
  error?: string;
};

export type QrLink = {
  id?: string;
  title: string;
  slug: string;
  destination_url: string;
  active?: boolean;
  scan_count?: number;
  monthly_scans?: number;
  url_health?: string;
  last_checked_at?: string;
  created_at?: string;
};

export type QrAnalytics = {
  success?: boolean;
  topCountry?: string;
  topDevice?: string;
  uniqueVisitors?: number;
  lastScan?: string | null;
  monthlyScansTotal?: number;
  urlHealth?: string;
  lastChecked?: string | null;
  error?: string;
};

export type SavedDesign = {
  url: string;
  path: string;
  created_at?: string;
  product_type?: string;
  prompt?: string;
  design_type?: string;
};

type BgUserRow = {
  email?: string;
  credits?: number | null;
  subscription_credits?: number | null;
  subscription_active?: boolean | null;
  plan_type?: string | null;
  max_qr_limit?: number | null;
  renewal_date?: string | null;
  last_payment_date?: string | null;
  payment_status?: string | null;
};

type DesignRow = {
  data?: {
    path?: string;
    product_type?: string;
    prompt?: string;
    type?: string;
  } | null;
  created_at?: string;
};

export function getStoredEmail() {
  if (typeof window === "undefined") return "";

  return localStorage.getItem("prntd_customer_email") ?? localStorage.getItem("prntd_email") ?? "";
}

export function storeEmail(email: string) {
  localStorage.setItem("prntd_customer_email", email.trim().toLowerCase());
}

export async function getAuthToken(email: string) {
  if (!email.trim()) return "";

  const response = await fetch("/api/prntd/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  const data = (await response.json()) as { token?: string; error?: string };

  if (!response.ok || !data.token) {
    throw new Error(data.error ?? "Unable to authenticate.");
  }

  storeEmail(email);
  localStorage.setItem("prntd_jwt", data.token);

  return data.token;
}

export async function getTokenOrCreate(email: string) {
  const existing = typeof window === "undefined" ? "" : localStorage.getItem("prntd_jwt");

  return existing || getAuthToken(email);
}

export async function fetchCredits(token: string) {
  const response = await fetch("/api/prntd/credits", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return (await response.json()) as CreditsResponse;
}

export async function fetchCreditsFromSupabase(email: string): Promise<CreditsResponse | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || !email.trim()) return null;

  const { data, error } = await supabase
    .from("bg_users")
    .select("credits, subscription_credits")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle<BgUserRow>();

  if (error || !data) return null;

  const purchased = Number(data.credits ?? 0);
  const subscription = Number(data.subscription_credits ?? 0);

  return {
    success: true,
    credits: purchased,
    subscription_credits: subscription,
    total_credits: purchased + subscription,
  };
}

export async function fetchCreditsConnected(email: string, token: string) {
  return (await fetchCreditsFromSupabase(email)) ?? fetchCredits(token);
}

export async function fetchSubscription(email: string) {
  const response = await fetch(`/api/prntd/get-subscription?email=${encodeURIComponent(email)}`);
  return (await response.json()) as SubscriptionResponse;
}

export async function fetchSubscriptionFromSupabase(email: string): Promise<SubscriptionResponse | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || !email.trim()) return null;

  const normalizedEmail = email.trim().toLowerCase();
  const { data: user, error } = await supabase
    .from("bg_users")
    .select("email, subscription_active, plan_type, max_qr_limit, renewal_date, last_payment_date, payment_status")
    .eq("email", normalizedEmail)
    .maybeSingle<BgUserRow>();

  if (error || !user) return null;

  const { count } = await supabase
    .from("qr_links")
    .select("id", { count: "exact", head: true })
    .eq("customer_email", normalizedEmail)
    .eq("active", true);

  const activeQrCount = Number(count ?? 0);
  const maxQrLimit = Number(user.max_qr_limit ?? 0);
  const renewalDate = user.renewal_date ? new Date(user.renewal_date) : null;
  const isExpired = Boolean(renewalDate && renewalDate < new Date());
  const isActive = Boolean(user.subscription_active) && !isExpired;

  return {
    success: true,
    subscription_active: isActive,
    plan_type: user.plan_type ?? "none",
    payment_status: isExpired ? "expired" : user.payment_status ?? "unpaid",
    active_qr_count: activeQrCount,
    max_qr_limit: maxQrLimit,
    remaining_slots: Math.max(maxQrLimit - activeQrCount, 0),
    renewal_date: user.renewal_date ?? null,
  };
}

export async function fetchSubscriptionConnected(email: string) {
  return (await fetchSubscriptionFromSupabase(email)) ?? fetchSubscription(email);
}

export async function fetchQrLinks(email: string) {
  const response = await fetch(`/api/prntd/my-qrs?email=${encodeURIComponent(email)}`);
  return (await response.json()) as QrLink[] | { error?: string };
}

export async function fetchQrLinksFromSupabase(email: string): Promise<QrLink[] | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || !email.trim()) return null;

  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabase
    .from("qr_links")
    .select("*")
    .eq("customer_email", normalizedEmail)
    .order("created_at", { ascending: false });

  if (error || !data) return null;

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const withScans = await Promise.all(
    (data as QrLink[]).map(async (qr) => {
      const { count } = await supabase
        .from("qr_scans")
        .select("*", { count: "exact", head: true })
        .eq("slug", qr.slug)
        .gte("scanned_at", startOfMonth);

      return {
        ...qr,
        monthly_scans: count ?? qr.monthly_scans ?? 0,
      };
    })
  );

  return withScans;
}

export async function fetchQrLinksConnected(email: string) {
  return (await fetchQrLinksFromSupabase(email)) ?? fetchQrLinks(email);
}

export async function fetchQrAnalytics(email: string) {
  const response = await fetch(`/api/prntd/qr-analytics?email=${encodeURIComponent(email)}`);
  return (await response.json()) as QrAnalytics;
}

export async function fetchDesigns(token: string) {
  const response = await fetch("/api/prntd/get-designs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return (await response.json()) as { designs?: SavedDesign[]; error?: string };
}

export async function fetchDesignsFromSupabase(email: string): Promise<{ designs?: SavedDesign[] } | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || !email.trim()) return null;

  const { data, error } = await supabase
    .from("designs")
    .select("data, created_at")
    .eq("user_id", email.trim().toLowerCase())
    .order("created_at", { ascending: false });

  if (error || !data) return null;

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
        product_type: design.data?.product_type ?? "",
        prompt: design.data?.prompt ?? "",
        design_type: design.data?.type ?? "",
      } satisfies SavedDesign;
    })
  );

  return {
    designs: designs.filter(Boolean) as SavedDesign[],
  };
}

export async function fetchDesignsConnected(email: string, token: string) {
  return (await fetchDesignsFromSupabase(email)) ?? fetchDesigns(token);
}

export function downloadUrl(url: string, filename = `prntd-${Date.now()}.png`) {
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const localUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = localUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(localUrl);
    })
    .catch(() => {
      window.open(url, "_blank", "noopener,noreferrer");
    });
}
