import { ApiError } from "@/lib/api-response";
import { getAllowedOrigins } from "@/lib/env";

export function getRequestBaseOrigin(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export function assertTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) return;

  const requestOrigin = getRequestBaseOrigin(request);
  const allowedOrigins = new Set([requestOrigin, ...getAllowedOrigins()]);

  if (!allowedOrigins.has(origin)) {
    throw new ApiError("Request origin is not allowed.", 403, "origin_not_allowed");
  }
}

export function assertJsonContentType(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    throw new ApiError("Expected application/json request body.", 415, "unsupported_media_type");
  }
}
