import * as legacyRoute from "@/lib/prntdLegacyRoute";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadLegacy() {
  return import("@/features/prntd-api/legacy/api.delete-qr");
}

export async function POST(request: Request) {
  return legacyRoute.legacyPost(loadLegacy(), request, undefined, {
    rateLimit: {
      scope: "prntd-delete-qr:ip",
      limit: 30,
      windowMs: 60_000,
    },
  });
}

export async function OPTIONS(request: Request) {
  return legacyRoute.legacyOptions(loadLegacy(), request);
}
