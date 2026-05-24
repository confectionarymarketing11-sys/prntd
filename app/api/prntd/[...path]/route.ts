import { NextRequest } from "next/server";
import { corsHeaders } from "@/lib/cors";
import { getOptionalEnv } from "@/lib/env";
import { checkRequestRateLimit } from "@/lib/rate-limit";
import { assertTrustedOrigin } from "@/lib/security";

const upstreamBase = "https://prntd-bg-remover.onrender.com/api";
const PROXY_TIMEOUT_MS = 25_000;
const legacyProxyEnabled = getOptionalEnv("PRNTD_ENABLE_LEGACY_PROXY") === "true";
const allowedProxyPaths = new Set(
  getOptionalEnv("PRNTD_LEGACY_PROXY_PATHS")
    .split(",")
    .map((path) => path.trim().replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
);

async function proxyRequest(request: NextRequest, pathParts: string[]) {
  assertTrustedOrigin(request);
  checkRequestRateLimit(request, "prntd-proxy:ip", { limit: 60, windowMs: 60_000 });

  const normalizedPath = pathParts.join("/");

  if (!legacyProxyEnabled || !allowedProxyPaths.has(normalizedPath)) {
    return Response.json(
      { error: "Legacy proxy route is disabled." },
      {
        status: 404,
        headers: corsHeaders(request),
      }
    );
  }

  const upstreamUrl = new URL(`${upstreamBase}/${normalizedPath}`);
  const requestUrl = new URL(request.url);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

  requestUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.set(key, value);
  });

  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");

  if (authorization) headers.set("authorization", authorization);
  if (contentType) headers.set("content-type", contentType);

  try {
    const response = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
      signal: controller.signal,
    });
    const responseHeaders = new Headers(response.headers);

    Object.entries(corsHeaders(request)).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return Response.json(
        { error: "Upstream request timed out" },
        {
          status: 504,
          headers: corsHeaders(request),
        }
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request, "GET, POST, OPTIONS"),
  });
}
