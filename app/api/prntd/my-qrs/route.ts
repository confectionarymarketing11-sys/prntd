import * as legacyRoute from "@/lib/prntdLegacyRoute";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadLegacy() {
  return import("@/features/prntd-api/legacy/api.my-qrs");
}

export async function GET(request: Request) {
  return legacyRoute.legacyGet(await loadLegacy(), request);
}

export async function OPTIONS(request: Request) {
  return legacyRoute.legacyOptions(await loadLegacy(), request);
}
