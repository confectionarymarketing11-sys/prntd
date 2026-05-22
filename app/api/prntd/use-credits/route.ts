import { z } from "zod";
import { ApiError, apiJson, withApiErrorHandling } from "@/lib/api-response";
import { requirePrntdEmail } from "@/lib/auth/jwt";
import { corsPreflight } from "@/lib/cors";
import { recordCreditTransaction } from "@/lib/credits";
import { createSupabaseAdminClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  amount: z.coerce.number().int().positive(),
});

export async function POST(request: Request) {
  return withApiErrorHandling(request, async () => {
    const email = requirePrntdEmail(request);
    const { amount } = bodySchema.parse(await request.json());
    const supabase = createSupabaseAdminClient();
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id, auth_user_id, credits_balance")
      .eq("email", email)
      .maybeSingle<{ id: string; auth_user_id: string | null; credits_balance: number | null }>();

    if (!customerError && customer) {
      const currentCredits = Number(customer.credits_balance ?? 0);

      if (currentCredits < amount) {
        throw new ApiError("Not enough credits", 400, "insufficient_credits");
      }

      const nextCredits = currentCredits - amount;
      const { data: updated, error: updateCustomerError } = await supabase
        .from("customers")
        .update({
          credits_balance: nextCredits,
          updated_at: new Date().toISOString(),
        })
        .eq("id", customer.id)
        .eq("credits_balance", currentCredits)
        .select("id")
        .maybeSingle<{ id: string }>();

      if (updateCustomerError || !updated) {
        throw new ApiError("Conflict, retry request", 409, "credit_conflict");
      }

      await recordCreditTransaction({
        customerId: customer.id,
        authUserId: customer.auth_user_id,
        amount: -amount,
        reason: "usage",
        source: "prntd_api",
        metadata: {
          endpoint: "use-credits",
        },
      });

      return apiJson(request, {
        success: true,
        credits: nextCredits,
        subscription_credits: 0,
        total_credits: nextCredits,
        source: "customers",
      });
    }

    const { data: user, error } = await supabase
      .from("bg_users")
      .select("credits, subscription_credits")
      .eq("email", email)
      .maybeSingle<{ credits: number | null; subscription_credits: number | null }>();

    if (error) {
      throw error;
    }

    if (!user) {
      throw new ApiError("User not found", 404, "user_not_found");
    }

    const purchased = Number(user.credits || 0);
    const subscriptionCredits = Number(user.subscription_credits || 0);

    if (subscriptionCredits + purchased < amount) {
      throw new ApiError("Not enough credits", 400, "insufficient_credits");
    }

    let remaining = amount;
    const subscriptionUsed = Math.min(subscriptionCredits, remaining);
    remaining -= subscriptionUsed;

    const purchasedUsed = Math.min(purchased, remaining);
    const newSubscriptionCredits = subscriptionCredits - subscriptionUsed;
    const newPurchasedCredits = purchased - purchasedUsed;

    const { data: updated, error: updateError } = await supabase
      .from("bg_users")
      .update({
        credits: newPurchasedCredits,
        subscription_credits: newSubscriptionCredits,
      })
      .eq("email", email)
      .eq("credits", purchased)
      .eq("subscription_credits", subscriptionCredits)
      .select("email")
      .maybeSingle<{ email: string }>();

    if (updateError || !updated) {
      throw new ApiError("Conflict, retry request", 409, "credit_conflict");
    }

    return apiJson(request, {
      success: true,
      credits: newPurchasedCredits,
      subscription_credits: newSubscriptionCredits,
      total_credits: newPurchasedCredits + newSubscriptionCredits,
    });
  });
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request, "POST, OPTIONS");
}
