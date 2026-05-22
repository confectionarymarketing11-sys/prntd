import { z } from "zod";
import { ApiError, apiJson, withApiErrorHandling } from "@/lib/api-response";
import { requirePrntdEmail } from "@/lib/auth/jwt";
import { corsPreflight } from "@/lib/cors";
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
