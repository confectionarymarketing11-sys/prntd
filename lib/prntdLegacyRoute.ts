import { apiErrorResponse, withTimeout } from "@/lib/api-response";
import { corsHeaders } from "@/lib/cors";

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

function missingHandler(name: string) {
  return Response.json({ error: `${name} handler is not implemented.` }, { status: 405 });
}

async function asLegacyModule(module: unknown | Promise<unknown>) {
  return (await module) as LegacyModule;
}

export async function legacyGet(module: unknown | Promise<unknown>, request: Request, params?: Record<string, string>) {
  try {
    const legacyModule = await asLegacyModule(module);

    if (legacyModule.GET) return withTimeout(Promise.resolve(legacyModule.GET(request)));
    if (legacyModule.loader) return withTimeout(Promise.resolve(legacyModule.loader({ request, params })));

    return missingHandler("GET");
  } catch (error) {
    return apiErrorResponse(request, error);
  }
}

export async function legacyPost(module: unknown | Promise<unknown>, request: Request, params?: Record<string, string>) {
  try {
    const legacyModule = await asLegacyModule(module);

    if (legacyModule.POST) return withTimeout(Promise.resolve(legacyModule.POST(request)));
    if (legacyModule.action) return withTimeout(Promise.resolve(legacyModule.action({ request, params })));

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
