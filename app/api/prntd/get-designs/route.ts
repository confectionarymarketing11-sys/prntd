import * as legacyRoute from "@/lib/prntdLegacyRoute";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadLegacy() {
  return import("@/features/prntd-api/legacy/api.get-designs");
}

export async function POST(request: Request) {
  return legacyRoute.legacyPost(loadLegacy(), request, undefined, {
    rateLimit: {
      scope: "prntd-get-designs:ip",
      limit: 60,
      windowMs: 60_000,
    },
  });
}

export async function OPTIONS(request: Request) {
  return legacyRoute.legacyOptions(loadLegacy(), request);
}
