import * as legacyRoute from "@/lib/prntdLegacyRoute";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadLegacy() {
  return import("@/features/prntd-api/legacy/api.edit-image");
}

export async function GET(request: Request) {
  return legacyRoute.legacyGet(loadLegacy(), request);
}

export async function POST(request: Request) {
  return legacyRoute.legacyPost(loadLegacy(), request, undefined, {
    maxContentLengthBytes: 12 * 1024 * 1024,
    rateLimit: {
      scope: "prntd-edit-image:ip",
      limit: 8,
      windowMs: 60_000,
    },
  });
}

export async function OPTIONS(request: Request) {
  return legacyRoute.legacyOptions(loadLegacy(), request);
}
