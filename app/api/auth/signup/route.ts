import { z } from "zod";
import { ApiError, apiJson, withApiErrorHandling } from "@/lib/api-response";
import { authVerificationTemplate, sendTransactionalEmail } from "@/lib/email";
import { getOptionalEnv } from "@/lib/env";
import { checkRequestRateLimit } from "@/lib/rate-limit";
import { assertJsonContentType, assertTrustedOrigin, getRequestBaseOrigin } from "@/lib/security";
import { createSupabaseAdminClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(128),
  fullName: z.string().trim().max(160).optional().default(""),
  nextPath: z.string().trim().max(240).optional().default("/login"),
});

function safeNextPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

function authConfirmUrl(request: Request, nextPath: string) {
  const origin = request.headers.get("origin") ?? getRequestBaseOrigin(request);
  const url = new URL("/auth/confirm", origin);
  url.searchParams.set("next", safeNextPath(nextPath));

  return url.toString();
}

export async function POST(request: Request) {
  return withApiErrorHandling(request, async () => {
    assertTrustedOrigin(request);
    assertJsonContentType(request);
    checkRequestRateLimit(request, "auth-signup:ip", { limit: 8, windowMs: 10 * 60_000 });

    const payload = signupSchema.parse(await request.json());
    checkRequestRateLimit(request, "auth-signup:email", {
      identifier: payload.email,
      limit: 3,
      windowMs: 30 * 60_000,
    });

    const redirectTo = authConfirmUrl(request, payload.nextPath);

    if (!getOptionalEnv("RESEND_API_KEY")) {
      throw new ApiError("RESEND_API_KEY is not configured, so the signup email was not sent.", 503, "email_not_configured");
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "signup",
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          full_name: payload.fullName,
        },
        redirectTo,
      },
    });

    if (error) {
      const message = error.message.toLowerCase().includes("already")
        ? "An account already exists for this email. Please sign in or use forgot password."
        : error.message;

      throw new ApiError(message, error.status || 400, "signup_failed");
    }

    const verificationUrl = data.properties?.action_link;

    if (!verificationUrl) {
      throw new ApiError("Supabase did not return a verification link.", 502, "verification_link_missing");
    }

    const email = authVerificationTemplate({
      verificationUrl,
      customerName: payload.fullName || null,
    });

    const result = await sendTransactionalEmail({
      eventKey: `auth-signup:${payload.email}:${crypto.randomUUID()}`,
      emailType: "auth_signup_verification",
      to: payload.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      metadata: {
        redirect_to: redirectTo,
      },
    });

    if ("skipped" in result && result.skipped) {
      throw new ApiError("RESEND_API_KEY is not configured, so the signup email was not sent.", 503, "email_not_configured");
    }

    return apiJson(request, {
      success: true,
      message: "Verification email sent. Check your inbox.",
    });
  });
}
