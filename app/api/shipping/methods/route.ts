import { NextResponse } from "next/server";
import { getActiveShippingMethods } from "@/features/shipping/data/shipping";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const methods = await getActiveShippingMethods();

    return NextResponse.json({ methods });
  } catch (error) {
    console.error("Shipping method load failed:", error);

    return NextResponse.json(
      { error: "Unable to load shipping methods" },
      { status: 500 },
    );
  }
}
