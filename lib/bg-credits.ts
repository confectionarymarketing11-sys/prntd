import { createSupabaseAdminClient } from "@/lib/supabase/service";

export type BgCreditRow = {
  email?: string | null;
  credits: number | null;
  subscription_credits: number | null;
  total_credits?: number | null;
  trial_credits?: number | null;
  trial_credits_expires_at?: string | null;
  trial_used?: boolean | null;
};

export type BgCreditColumns = {
  hasTotalColumn: boolean;
  hasTrialColumns: boolean;
};

export type BgCreditSnapshot = {
  credits: number;
  subscriptionCredits: number;
  trialCredits: number;
  totalCredits: number;
  trialCreditsExpiresAt: string | null;
  source: "bg_users.total_credits" | "bg_users.computed";
};

type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>;

const trialSelect = "credits, subscription_credits, total_credits, trial_credits, trial_credits_expires_at, trial_used";
const totalSelect = "credits, subscription_credits, total_credits";
const legacySelect = "credits, subscription_credits";

function isMissingColumn(error: { code?: string; message?: string } | null | undefined, column: string) {
  return error?.code === "42703" || Boolean(error?.message?.includes(column));
}

function parseCredits(value: number | null | undefined) {
  return Math.max(0, Number(value ?? 0));
}

export function activeTrialCredits(row: Pick<BgCreditRow, "trial_credits" | "trial_credits_expires_at"> | null) {
  const trialCredits = parseCredits(row?.trial_credits);
  const expiresAt = row?.trial_credits_expires_at;

  if (!trialCredits || !expiresAt) return 0;

  const expiry = new Date(expiresAt);
  if (Number.isNaN(expiry.getTime()) || expiry.getTime() <= Date.now()) {
    return 0;
  }

  return trialCredits;
}

export function toCreditSnapshot(row: BgCreditRow | null): BgCreditSnapshot {
  const credits = parseCredits(row?.credits);
  const subscriptionCredits = parseCredits(row?.subscription_credits);
  const trialCredits = activeTrialCredits(row);
  const totalCredits = credits + subscriptionCredits + trialCredits;

  return {
    credits,
    subscriptionCredits,
    trialCredits,
    totalCredits,
    trialCreditsExpiresAt: trialCredits ? row?.trial_credits_expires_at ?? null : null,
    source: row?.total_credits !== null && row?.total_credits !== undefined ? "bg_users.total_credits" : "bg_users.computed",
  };
}

export async function selectBgCredits(supabase: SupabaseAdminClient, email: string) {
  const withTrial = await supabase.from("bg_users").select(trialSelect).eq("email", email).maybeSingle<BgCreditRow>();

  if (!withTrial.error || withTrial.error.code === "PGRST116") {
    return {
      data: withTrial.data,
      hasTotalColumn: true,
      hasTrialColumns: true,
    };
  }

  if (!isMissingColumn(withTrial.error, "trial_credits")) {
    throw withTrial.error;
  }

  const withTotal = await supabase.from("bg_users").select(totalSelect).eq("email", email).maybeSingle<BgCreditRow>();

  if (!withTotal.error || withTotal.error.code === "PGRST116") {
    return {
      data: withTotal.data,
      hasTotalColumn: true,
      hasTrialColumns: false,
    };
  }

  if (!isMissingColumn(withTotal.error, "total_credits")) {
    throw withTotal.error;
  }

  const fallback = await supabase.from("bg_users").select(legacySelect).eq("email", email).maybeSingle<BgCreditRow>();

  if (fallback.error && fallback.error.code !== "PGRST116") {
    throw fallback.error;
  }

  return {
    data: fallback.data,
    hasTotalColumn: false,
    hasTrialColumns: false,
  };
}

export async function createBgUserCredits(
  supabase: SupabaseAdminClient,
  email: string,
  columns: BgCreditColumns,
) {
  const row: Record<string, unknown> = {
    email,
    credits: 3,
    subscription_credits: 0,
    has_received_free_credits: true,
  };

  if (columns.hasTrialColumns) {
    row.trial_credits = 0;
    row.trial_used = false;
  }

  if (columns.hasTotalColumn) {
    row.total_credits = 3;
  }

  const created = await supabase
    .from("bg_users")
    .insert(row)
    .select(columns.hasTrialColumns ? trialSelect : columns.hasTotalColumn ? totalSelect : legacySelect)
    .single<BgCreditRow>();

  if (created.error) {
    throw created.error;
  }

  return created.data;
}

export async function updateBgCredits({
  supabase,
  email,
  previous,
  next,
  columns,
}: {
  supabase: SupabaseAdminClient;
  email: string;
  previous?: {
    credits: number;
    subscriptionCredits: number;
    trialCredits?: number;
  };
  next: {
    credits: number;
    subscriptionCredits: number;
    trialCredits?: number;
    trialCreditsExpiresAt?: string | null;
    trialUsed?: boolean;
  };
  columns: BgCreditColumns;
}) {
  const payload: Record<string, unknown> = {
    credits: next.credits,
    subscription_credits: next.subscriptionCredits,
  };

  const nextTrialCredits = columns.hasTrialColumns ? parseCredits(next.trialCredits) : 0;

  if (columns.hasTrialColumns) {
    payload.trial_credits = nextTrialCredits;
    payload.trial_credits_expires_at = next.trialCreditsExpiresAt ?? null;

    if (typeof next.trialUsed === "boolean") {
      payload.trial_used = next.trialUsed;
    }
  }

  if (columns.hasTotalColumn) {
    payload.total_credits = next.credits + next.subscriptionCredits + nextTrialCredits;
  }

  let query = supabase.from("bg_users").update(payload).eq("email", email);

  if (previous) {
    query = query.eq("credits", previous.credits).eq("subscription_credits", previous.subscriptionCredits);

    if (columns.hasTrialColumns) {
      query = query.eq("trial_credits", previous.trialCredits ?? 0);
    }
  }

  const updated = await query.select("email").maybeSingle<{ email: string }>();

  if (!updated.error) {
    return updated.data;
  }

  if (columns.hasTrialColumns && isMissingColumn(updated.error, "trial_credits")) {
    return updateBgCredits({
      supabase,
      email,
      previous,
      next,
      columns: {
        hasTotalColumn: columns.hasTotalColumn,
        hasTrialColumns: false,
      },
    });
  }

  if (columns.hasTotalColumn && isMissingColumn(updated.error, "total_credits")) {
    return updateBgCredits({
      supabase,
      email,
      previous,
      next,
      columns: {
        hasTotalColumn: false,
        hasTrialColumns: columns.hasTrialColumns,
      },
    });
  }

  throw updated.error;
}

export async function clearExpiredTrialCredits(supabase: SupabaseAdminClient, email: string) {
  const selected = await selectBgCredits(supabase, email);

  if (!selected.data || !selected.hasTrialColumns) {
    return selected.data;
  }

  const storedTrialCredits = parseCredits(selected.data.trial_credits);
  if (!storedTrialCredits || activeTrialCredits(selected.data)) {
    return selected.data;
  }

  await updateBgCredits({
    supabase,
    email,
    previous: {
      credits: parseCredits(selected.data.credits),
      subscriptionCredits: parseCredits(selected.data.subscription_credits),
      trialCredits: storedTrialCredits,
    },
    next: {
      credits: parseCredits(selected.data.credits),
      subscriptionCredits: parseCredits(selected.data.subscription_credits),
      trialCredits: 0,
      trialCreditsExpiresAt: null,
    },
    columns: selected,
  });

  return {
    ...selected.data,
    trial_credits: 0,
    trial_credits_expires_at: null,
  };
}
