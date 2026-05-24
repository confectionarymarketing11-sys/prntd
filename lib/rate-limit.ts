import { ApiError } from "@/lib/api-response";

type Bucket = {
  hits: number[];
};

const buckets = new Map<string, Bucket>();

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("cf-connecting-ip") || "unknown";
}

export function checkRateLimit(identifier: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const bucket = buckets.get(identifier) ?? { hits: [] };
  const hits = bucket.hits.filter((timestamp) => now - timestamp < windowMs);

  if (hits.length >= limit) {
    throw new ApiError("Too many requests", 429, "rate_limited");
  }

  hits.push(now);
  buckets.set(identifier, { hits });
}

export function checkRequestRateLimit(
  request: Request,
  scope: string,
  options: {
    limit?: number;
    windowMs?: number;
    identifier?: string | null;
  } = {}
) {
  const identifier = options.identifier || getClientIp(request);
  checkRateLimit(`${scope}:${identifier}`, options.limit ?? 20, options.windowMs ?? 60_000);
}
