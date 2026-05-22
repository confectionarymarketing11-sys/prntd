import { NextRequest, NextResponse } from "next/server";
import { calculateDiscount } from "@/features/discounts/data/discounts";

type PreviewPayload = {
  code?: string;
  customerEmail?: string;
  subtotal: number;
  shipping: number;
  items: { productId: string; quantity: number; lineTotal: number }[];
};

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as PreviewPayload;
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
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to preview discount" }, { status: 500 });
  }
}
