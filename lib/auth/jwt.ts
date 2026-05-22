import jwt, { type JwtPayload } from "jsonwebtoken";
import { ApiError } from "@/lib/api-response";
import { getEnv } from "@/lib/env";

export type PrntdJwtPayload = JwtPayload & {
  email?: string;
};

export function getBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError("Unauthorized", 401, "unauthorized");
  }

  return authHeader.slice("Bearer ".length).trim();
}

export function verifyPrntdJwt(request: Request) {
  const token = getBearerToken(request);
  const decoded = jwt.verify(token, getEnv("JWT_SECRET")) as PrntdJwtPayload;

  if (!decoded.email) {
    throw new ApiError("Invalid token", 401, "invalid_token");
  }

  return {
    ...decoded,
    email: decoded.email.toLowerCase().trim(),
  };
}

export function requirePrntdEmail(request: Request) {
  return verifyPrntdJwt(request).email;
}
