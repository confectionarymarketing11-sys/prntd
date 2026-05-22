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

function asLegacyModule(module: unknown) {
  return module as LegacyModule;
}

export function legacyGet(module: unknown, request: Request, params?: Record<string, string>) {
  const legacyModule = asLegacyModule(module);

  if (legacyModule.GET) return legacyModule.GET(request);
  if (legacyModule.loader) return legacyModule.loader({ request, params });

  return missingHandler("GET");
}

export function legacyPost(module: unknown, request: Request, params?: Record<string, string>) {
  const legacyModule = asLegacyModule(module);

  if (legacyModule.POST) return legacyModule.POST(request);
  if (legacyModule.action) return legacyModule.action({ request, params });

  return missingHandler("POST");
}

export function legacyOptions(module: unknown, request: Request, params?: Record<string, string>) {
  const legacyModule = asLegacyModule(module);

  if (legacyModule.loader) return legacyModule.loader({ request, params });

  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  });
}
