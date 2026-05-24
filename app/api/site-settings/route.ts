import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/features/admin/data/auth";
import { getSiteSettings } from "@/features/site-settings/data/site-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSiteSettings();
  const admin = await getCurrentAdmin();

  return NextResponse.json({
    ...settings,
    test_mode_enabled: Boolean(admin && settings.test_mode_enabled),
  });
}
