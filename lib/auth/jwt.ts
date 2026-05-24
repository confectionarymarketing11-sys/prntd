import jwt, { type JwtPayload } from "jsonwebtoken";
import { ApiError } from "@/lib/api-response";
import { getEnv } from "@/lib/env";

export type PrntdJwtPayload = JwtPayload & {
  email?: string;
  scope?: string;
};

export const PRNTD_API_TOKEN_SCOPE = "prntd_api";

export function getBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError("Unauthorized", 401, "unauthorized");
  }

  return authHeader.slice("Bearer ".length).trim();
}

export function verifyPrntdJwt(request: Request) {
  const token = getBearerToken(request);
  let decoded: PrntdJwtPayload;

  try {
    decoded = jwt.verify(token, getEnv("JWT_SECRET"), {
      issuer: "prntd-next",
      audience: "prntd-api",
    }) as PrntdJwtPayload;
  } catch {
    throw new ApiError("Invalid token", 401, "invalid_token");
  }

  if (!decoded.email) {
    throw new ApiError("Invalid token", 401, "invalid_token");
  }

  if (decoded.scope !== PRNTD_API_TOKEN_SCOPE) {
    throw new ApiError("Invalid token scope", 401, "invalid_token_scope");
  }

  return {
    ...decoded,
    email: decoded.email.toLowerCase().trim(),
  };
}

export function requirePrntdEmail(request: Request) {
  return verifyPrntdJwt(request).email;
}

export function requireMatchingPrntdEmail(request: Request, email: string | null | undefined) {
  const tokenEmail = requirePrntdEmail(request);
  const requestedEmail = email?.trim().toLowerCase();

  if (!requestedEmail || tokenEmail !== requestedEmail) {
    throw new ApiError("Unauthorized", 403, "email_mismatch");
  }

  return tokenEmail;
}
