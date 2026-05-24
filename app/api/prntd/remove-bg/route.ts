import * as legacyRoute from "@/lib/prntdLegacyRoute";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadLegacy() {
  return import("@/features/prntd-api/legacy/api.remove-bg");
}

export async function POST(request: Request) {
  return legacyRoute.legacyPost(loadLegacy(), request, undefined, {
    maxContentLengthBytes: 12 * 1024 * 1024,
    rateLimit: {
      scope: "prntd-remove-bg:ip",
      limit: 10,
      windowMs: 60_000,
    },
  });
}

export async function OPTIONS(request: Request) {
  return legacyRoute.legacyOptions(loadLegacy(), request);
}
