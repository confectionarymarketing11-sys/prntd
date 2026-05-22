import * as legacyRoute from "@/lib/prntdLegacyRoute";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadLegacy() {
  return import("@/features/prntd-api/legacy/api.auth");
}

export async function POST(request: Request) {
  return legacyRoute.legacyPost(await loadLegacy(), request);
}

export async function OPTIONS(request: Request) {
  return legacyRoute.legacyOptions(await loadLegacy(), request);
}
