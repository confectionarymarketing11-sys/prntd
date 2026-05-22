import { getAllowedOrigins } from "@/lib/env";

export function getRequestOrigin(request: Request) {
  return request.headers.get("origin") || "";
}

export function getCorsOrigin(origin: string) {
  const allowedOrigins = getAllowedOrigins();

  if (origin && allowedOrigins.includes(origin)) {
    return origin;
  }

  return allowedOrigins[0] ?? "https://www.prntd.ca";
}

export function corsHeaders(requestOrOrigin?: Request | string, methods = "GET, POST, OPTIONS") {
  const origin = typeof requestOrOrigin === "string" ? requestOrOrigin : requestOrOrigin ? getRequestOrigin(requestOrOrigin) : "";

  return {
    "Access-Control-Allow-Origin": getCorsOrigin(origin),
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}

export function corsPreflight(request: Request, methods?: string) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request, methods),
  });
}
