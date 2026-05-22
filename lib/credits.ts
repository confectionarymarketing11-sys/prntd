import { ApiError } from "@/lib/api-response";
import { requireCustomer } from "@/lib/auth/customer";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type CreditReason = "subscription_grant" | "top_up" | "usage" | "refund" | "admin_adjustment";

export async function requireCredits(amount: number) {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new ApiError("Credit amount must be a positive integer", 400, "invalid_credit_amount");
  }

  const { customer, user } = await requireCustomer();

  if (customer.credits_balance < amount) {
    throw new ApiError("Not enough credits", 402, "insufficient_credits");
  }

  return {
    user,
    customer,
    availableCredits: customer.credits_balance,
  };
}

export async function recordCreditTransaction({
  customerId,
  authUserId,
  amount,
  reason,
  source,
  stripeEventId,
  metadata = {},
}: {
  customerId: string;
  authUserId?: string | null;
  amount: number;
  reason: CreditReason;
  source: string;
  stripeEventId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("credit_transactions").insert({
    customer_id: customerId,
    auth_user_id: authUserId ?? null,
    amount,
    reason,
    source,
    stripe_event_id: stripeEventId ?? null,
    metadata,
  });

  if (error) {
    throw error;
  }
}
