import * as legacyRoute from "@/lib/prntdLegacyRoute";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadLegacy() {
  return import("@/features/prntd-api/legacy/api.create-user");
}

export async function POST(request: Request) {
  return legacyRoute.legacyPost(loadLegacy(), request, undefined, {
    rateLimit: {
      scope: "prntd-create-user:ip",
      limit: 20,
      windowMs: 60_000,
    },
  });
}

export async function OPTIONS(request: Request) {
  return legacyRoute.legacyOptions(loadLegacy(), request);
}
