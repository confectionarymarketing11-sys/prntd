import { NextResponse } from "next/server";
import { shopProducts } from "@/data/shop";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const fallback = Object.fromEntries(shopProducts.map((product) => [product.id, { price: product.basePrice, currency: "CAD" }]));

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select("slug, price_cents, currency, status, visibility")
      .in("slug", shopProducts.map((product) => product.id));

    if (error) {
      return NextResponse.json(fallback);
    }

    const pricing = { ...fallback };

    for (const row of data ?? []) {
      const slug = String((row as { slug?: string }).slug ?? "");
      const status = String((row as { status?: string }).status ?? "");
      const visibility = String((row as { visibility?: string }).visibility ?? "");

      if (!slug || status === "archived" || visibility === "hidden") continue;

      pricing[slug] = {
        price: Number((row as { price_cents?: number }).price_cents ?? 0) / 100,
        currency: String((row as { currency?: string }).currency ?? "CAD"),
      };
    }

    return NextResponse.json(pricing);
  } catch {
    return NextResponse.json(fallback);
  }
}
