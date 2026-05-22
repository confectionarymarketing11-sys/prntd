import * as legacyRoute from "@/lib/prntdLegacyRoute";
import { getOptionalEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const generateDesignTimeoutMs = Number(getOptionalEnv("PRNTD_GENERATE_DESIGN_TIMEOUT_MS", "110000"));

async function loadLegacy() {
  return import("@/features/prntd-api/legacy/api.generate-design");
}

export async function POST(request: Request) {
  return legacyRoute.legacyPost(loadLegacy(), request, undefined, {
    timeoutMs: Number.isFinite(generateDesignTimeoutMs) ? generateDesignTimeoutMs : 110_000,
  });
}

export async function OPTIONS(request: Request) {
  return legacyRoute.legacyOptions(loadLegacy(), request);
}
