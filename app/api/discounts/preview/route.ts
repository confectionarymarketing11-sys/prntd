import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateDiscount } from "@/features/discounts/data/discounts";
import { checkRequestRateLimit } from "@/lib/rate-limit";
import { assertJsonContentType, assertTrustedOrigin } from "@/lib/security";

const previewSchema = z.object({
  code: z.string().trim().max(80).optional(),
  customerEmail: z.string().trim().email().optional().or(z.literal("")),
  subtotal: z.coerce.number().min(0).max(100_000),
  shipping: z.coerce.number().min(0).max(10_000),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1).max(120),
        quantity: z.coerce.number().int().min(1).max(1000),
        lineTotal: z.coerce.number().min(0).max(100_000),
      })
    )
    .max(50)
    .default([]),
});

export async function POST(req: NextRequest) {
  try {
    assertTrustedOrigin(req);
    assertJsonContentType(req);
    checkRequestRateLimit(req, "discount-preview:ip", { limit: 60, windowMs: 60_000 });

    const payload = previewSchema.parse(await req.json());
    const subtotalCents = Math.round(Number(payload.subtotal ?? 0) * 100);
    const shippingCents = Math.round(Number(payload.shipping ?? 0) * 100);

    const result = await calculateDiscount({
      code: payload.code,
      customerEmail: payload.customerEmail,
      subtotalCents,
      shippingCents,
      items: (payload.items ?? []).map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity ?? 0),
        lineTotalCents: Math.round(Number(item.lineTotal ?? 0) * 100),
      })),
    });

    return NextResponse.json({
      code: result.discount?.code ?? null,
      title: result.discount?.title ?? null,
      discountAmount: result.discountAmountCents / 100,
      shippingDiscount: result.shippingDiscountCents / 100,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid discount preview" }, { status: 400 });
    }

    if (error instanceof Error && "status" in error) {
      return NextResponse.json({ error: error.message }, { status: Number((error as { status?: number }).status ?? 500) });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to preview discount" }, { status: 500 });
  }
}
