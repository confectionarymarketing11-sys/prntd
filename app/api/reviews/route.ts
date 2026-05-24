import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRequestRateLimit } from "@/lib/rate-limit";
import { assertJsonContentType, assertTrustedOrigin } from "@/lib/security";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const reviewSchema = z.object({
  productId: z.string().min(1),
  customerName: z.string().trim().min(1).max(120),
  customerEmail: z.string().trim().email().optional().or(z.literal("")),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(140).optional().or(z.literal("")),
  body: z.string().trim().min(8).max(1200),
});

export async function POST(request: NextRequest) {
  try {
    assertTrustedOrigin(request);
    assertJsonContentType(request);
    checkRequestRateLimit(request, "reviews:ip", { limit: 5, windowMs: 10 * 60_000 });

    const payload = reviewSchema.parse(await request.json());
    checkRequestRateLimit(request, "reviews:email", {
      identifier: payload.customerEmail || payload.customerName,
      limit: 3,
      windowMs: 30 * 60_000,
    });

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("reviews").insert({
      product_id: payload.productId,
      customer_name: payload.customerName,
      customer_email: payload.customerEmail || null,
      rating: payload.rating,
      title: payload.title || null,
      body: payload.body,
      status: "pending",
      source: "product_page",
    });

    if (error) {
      console.error("Review insert failed:", error.message);
      return NextResponse.json({ error: "Review could not be submitted." }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: "Thanks. Your review is waiting for approval.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid review" }, { status: 400 });
    }

    if (error instanceof Error && "status" in error) {
      return NextResponse.json({ error: error.message }, { status: Number((error as { status?: number }).status ?? 500) });
    }

    return NextResponse.json({ error: "Review could not be submitted." }, { status: 500 });
  }
}
