import jwt from "jsonwebtoken";
import { z } from "zod";
import { ApiError, apiJson, withApiErrorHandling } from "@/lib/api-response";
import { corsPreflight } from "@/lib/cors";
import { getEnv } from "@/lib/env";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function POST(request: Request) {
  return withApiErrorHandling(request, async () => {
    const { email } = bodySchema.parse(await request.json());
    const identifier = `${getClientIp(request)}:${email}`;

    checkRateLimit(identifier, 20, 60_000);

    const supabase = createSupabaseAdminClient();
    let userId: string | null = null;

    const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
    });

    if (!createError && createdUser.user?.id) {
      userId = createdUser.user.id;
    }

    if (!userId) {
      const { data, error } = await supabase.auth.admin.listUsers();

      if (error) {
        throw new ApiError("User lookup failed", 500, "user_lookup_failed");
      }

      userId = data.users.find((user) => user.email === email)?.id ?? null;
    }

    if (!userId) {
      throw new ApiError("User lookup failed", 500, "user_lookup_failed");
    }

    const token = jwt.sign({ email }, getEnv("JWT_SECRET"), { expiresIn: "24h" });
    const supabaseToken = jwt.sign(
      {
        sub: userId,
        email,
        role: "authenticated",
        aud: "authenticated",
      },
      getEnv("SUPABASE_JWT_SECRET"),
      { expiresIn: "1h" }
    );

    return apiJson(request, {
      success: true,
      token,
      supabaseToken,
    });
  });
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request, "POST, OPTIONS");
}
