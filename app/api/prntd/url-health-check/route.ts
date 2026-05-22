import * as legacyRoute from "@/lib/prntdLegacyRoute";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadLegacy() {
  return import("@/features/prntd-api/legacy/api.url-health-check");
}

export async function GET(request: Request) {
  return legacyRoute.legacyGet(await loadLegacy(), request);
}
