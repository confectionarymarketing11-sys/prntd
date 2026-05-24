import { apiErrorResponse, withTimeout } from "@/lib/api-response";
import { corsHeaders } from "@/lib/cors";
import { checkRequestRateLimit } from "@/lib/rate-limit";
import { assertTrustedOrigin } from "@/lib/security";

type LegacyHandlerArgs = {
  request: Request;
  params?: Record<string, string>;
};

type LegacyModule = {
  loader?: (args: LegacyHandlerArgs) => Response | Promise<Response>;
  action?: (args: LegacyHandlerArgs) => Response | Promise<Response>;
  GET?: (request: Request) => Response | Promise<Response>;
  POST?: (request: Request) => Response | Promise<Response>;
};

type LegacyRouteOptions = {
  timeoutMs?: number;
  maxContentLengthBytes?: number;
  rateLimit?: {
    scope: string;
    limit?: number;
    windowMs?: number;
  };
};

function missingHandler(name: string) {
  return Response.json({ error: `${name} handler is not implemented.` }, { status: 405 });
}

async function asLegacyModule(module: unknown | Promise<unknown>) {
  return (await module) as LegacyModule;
}

export async function legacyGet(module: unknown | Promise<unknown>, request: Request, params?: Record<string, string>, options: LegacyRouteOptions = {}) {
  try {
    assertTrustedOrigin(request);

    const legacyModule = await asLegacyModule(module);
    const timeoutMs = options.timeoutMs ?? 25_000;

    if (legacyModule.GET) return withTimeout(Promise.resolve(legacyModule.GET(request)), timeoutMs);
    if (legacyModule.loader) return withTimeout(Promise.resolve(legacyModule.loader({ request, params })), timeoutMs);

    return missingHandler("GET");
  } catch (error) {
    return apiErrorResponse(request, error);
  }
}

export async function legacyPost(module: unknown | Promise<unknown>, request: Request, params?: Record<string, string>, options: LegacyRouteOptions = {}) {
  try {
    assertTrustedOrigin(request);

    if (options.maxContentLengthBytes) {
      const contentLength = Number(request.headers.get("content-length") ?? 0);

      if (contentLength > options.maxContentLengthBytes) {
        return Response.json(
          { error: "Request body is too large" },
          {
            status: 413,
            headers: corsHeaders(request),
          }
        );
      }
    }

    if (options.rateLimit) {
      checkRequestRateLimit(request, options.rateLimit.scope, {
        limit: options.rateLimit.limit,
        windowMs: options.rateLimit.windowMs,
      });
    }

    const legacyModule = await asLegacyModule(module);
    const timeoutMs = options.timeoutMs ?? 25_000;

    if (legacyModule.POST) return withTimeout(Promise.resolve(legacyModule.POST(request)), timeoutMs);
    if (legacyModule.action) return withTimeout(Promise.resolve(legacyModule.action({ request, params })), timeoutMs);

    return missingHandler("POST");
  } catch (error) {
    return apiErrorResponse(request, error);
  }
}

export async function legacyOptions(module: unknown | Promise<unknown>, request: Request, params?: Record<string, string>) {
  try {
    const legacyModule = await asLegacyModule(module);

    if (legacyModule.loader) return withTimeout(Promise.resolve(legacyModule.loader({ request, params })), 10_000);

    return new Response(null, {
      status: 204,
      headers: corsHeaders(request),
    });
  } catch (error) {
    return apiErrorResponse(request, error);
  }
}
