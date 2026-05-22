import { apiJson, withApiErrorHandling } from "@/lib/api-response";
import { requirePrntdEmail } from "@/lib/auth/jwt";
import { corsPreflight } from "@/lib/cors";
import { createSupabaseAdminClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return withApiErrorHandling(request, async () => {
    const email = requirePrntdEmail(request);
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
      const initialUser = {
        email,
        credits: 3,
        subscription_credits: 0,
        has_received_free_credits: true,
      };

      const { error: insertError } = await supabase.from("bg_users").insert(initialUser);

      if (insertError) {
        throw insertError;
      }

      return apiJson(request, {
        success: true,
        credits: 3,
        subscription_credits: 0,
        total_credits: 3,
      });
    }

    const credits = Number(user.credits || 0);
    const subscriptionCredits = Number(user.subscription_credits || 0);

    return apiJson(request, {
      success: true,
      credits,
      subscription_credits: subscriptionCredits,
      total_credits: credits + subscriptionCredits,
    });
  });
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request, "GET, OPTIONS");
}
