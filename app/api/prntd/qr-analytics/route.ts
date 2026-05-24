import * as legacyRoute from "@/lib/prntdLegacyRoute";
import { requireMatchingPrntdEmail } from "@/lib/auth/jwt";
import { withApiErrorHandling } from "@/lib/api-response";
import { checkRequestRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadLegacy() {
  return import("@/features/prntd-api/legacy/api.qr-analytics");
}

export async function GET(request: Request) {
  return withApiErrorHandling(request, async () => {
    const email = new URL(request.url).searchParams.get("email");
    requireMatchingPrntdEmail(request, email);
    checkRequestRateLimit(request, "prntd-qr-analytics:ip", { limit: 60, windowMs: 60_000 });

    return legacyRoute.legacyGet(loadLegacy(), request);
  });
}

export async function OPTIONS(request: Request) {
  return legacyRoute.legacyOptions(loadLegacy(), request);
}
