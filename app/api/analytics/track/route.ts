import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const eventTypes = ["page_view", "added_to_cart", "reached_checkout", "checkout_completed"] as const;

const analyticsSchema = z.object({
  eventType: z.enum(eventTypes),
  visitorId: z.string().trim().min(8).max(120),
  sessionId: z.string().trim().min(8).max(120),
  customerEmail: z.string().trim().email().optional().or(z.literal("")),
  pathname: z.string().trim().max(500).optional(),
  referrer: z.string().trim().max(1000).optional().or(z.literal("")),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

function getIpHash(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const ip = forwarded || realIp || "unknown";
  const salt = process.env.ANALYTICS_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "prntd";

  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const payload = analyticsSchema.parse(await request.json());
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("storefront_events").insert({
      event_type: payload.eventType,
      visitor_id: payload.visitorId,
      session_id: payload.sessionId,
      customer_email: payload.customerEmail || null,
      pathname: payload.pathname || null,
      referrer: payload.referrer || null,
      user_agent: request.headers.get("user-agent") || null,
      ip_hash: getIpHash(request),
      metadata: payload.metadata ?? {},
    });

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ ok: true, skipped: "storefront_events_missing" });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid analytics event" }, { status: 400 });
    }

    return NextResponse.json({ error: "Analytics event failed" }, { status: 500 });
  }
}
