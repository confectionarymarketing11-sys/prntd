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

export async function fetchCredits(token: string) {
  const response = await fetch("/api/prntd/credits", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return (await response.json()) as CreditsResponse;
}

export async function fetchSubscription(email: string, token: string) {
  const response = await fetch(`/api/prntd/get-subscription?email=${encodeURIComponent(email)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return (await response.json()) as SubscriptionResponse;
}

export async function fetchQrLinks(email: string, token: string) {
  const response = await fetch(`/api/prntd/my-qrs?email=${encodeURIComponent(email)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return (await response.json()) as QrLink[] | { error?: string };
}

export async function fetchQrAnalytics(email: string, token: string) {
  const response = await fetch(`/api/prntd/qr-analytics?email=${encodeURIComponent(email)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
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
