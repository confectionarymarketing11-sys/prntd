import jwt from "jsonwebtoken";
import { z } from "zod";
import { ApiError, apiJson, withApiErrorHandling } from "@/lib/api-response";
import { PRNTD_API_TOKEN_SCOPE } from "@/lib/auth/jwt";
import { getOrCreateCustomerForEmail } from "@/lib/auth/customer";
import { corsPreflight } from "@/lib/cors";
import { getEnv } from "@/lib/env";
import { checkRequestRateLimit, getClientIp } from "@/lib/rate-limit";
import { assertJsonContentType, assertTrustedOrigin } from "@/lib/security";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function POST(request: Request) {
  return withApiErrorHandling(request, async () => {
    assertTrustedOrigin(request);
    assertJsonContentType(request);
    checkRequestRateLimit(request, "prntd-auth:ip", { limit: 20, windowMs: 60_000 });

    const { email } = bodySchema.parse(await request.json());
    const identifier = `${getClientIp(request)}:${email}`;

    checkRequestRateLimit(request, "prntd-auth:email", {
      identifier,
      limit: 10,
      windowMs: 10 * 60_000,
    });

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      throw new ApiError("Sign in required", 401, "auth_session_required");
    }

    const sessionEmail = user.email.trim().toLowerCase();

    if (sessionEmail !== email) {
      throw new ApiError("Authenticated user does not match requested account.", 403, "email_mismatch");
    }

    await getOrCreateCustomerForEmail({
      email,
      authUserId: user.id,
    });

    const token = jwt.sign(
      {
        sub: user.id,
        email,
        scope: PRNTD_API_TOKEN_SCOPE,
      },
      getEnv("JWT_SECRET"),
      {
        expiresIn: "2h",
        issuer: "prntd-next",
        audience: "prntd-api",
      }
    );

    return apiJson(request, {
      success: true,
      token,
    });
  });
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request, "POST, OPTIONS");
}
