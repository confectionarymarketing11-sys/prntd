import { NextResponse } from "next/server";
import { shopProducts } from "@/data/shop";
import type { ProductPricing } from "@/data/shop";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const fallback: Record<string, ProductPricing> = Object.fromEntries(
    shopProducts.map((product) => [product.id, { price: product.basePrice, currency: "CAD", variants: [] }])
  );

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select(`
        slug,
        price_cents,
        currency,
        status,
        visibility,
        variants:product_variants(
          id,
          title,
          sku,
          price_cents,
          inventory_quantity,
          active,
          option1_name,
          option1_value,
          option2_name,
          option2_value,
          option3_name,
          option3_value,
          position
        )
      `)
      .in("slug", shopProducts.map((product) => product.id));

    if (error) {
      return NextResponse.json(fallback);
    }

    const pricing: Record<string, ProductPricing> = { ...fallback };

    for (const row of data ?? []) {
      const slug = String((row as { slug?: string }).slug ?? "");
      const status = String((row as { status?: string }).status ?? "");
      const visibility = String((row as { visibility?: string }).visibility ?? "");

      if (!slug || status === "archived" || visibility === "hidden") continue;

      pricing[slug] = {
        price: Number((row as { price_cents?: number }).price_cents ?? 0) / 100,
        currency: String((row as { currency?: string }).currency ?? "CAD"),
        variants: (((row as { variants?: Array<Record<string, unknown>> }).variants ?? []) as Array<Record<string, unknown>>)
          .sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0))
          .map((variant) => ({
            id: String(variant.id ?? ""),
            title: String(variant.title ?? "Default Title"),
            sku: variant.sku ? String(variant.sku) : null,
            price: Number(variant.price_cents ?? 0) / 100,
            currency: String((row as { currency?: string }).currency ?? "CAD"),
            inventory_quantity: Number(variant.inventory_quantity ?? 0),
            active: Boolean(variant.active),
            options: Object.fromEntries(
              [
                [variant.option1_name, variant.option1_value],
                [variant.option2_name, variant.option2_value],
                [variant.option3_name, variant.option3_value],
              ]
                .filter(([name, value]) => name && value)
                .map(([name, value]) => [String(name), String(value)])
            ),
          })),
      };
    }

    return NextResponse.json(pricing);
  } catch {
    return NextResponse.json(fallback);
  }
}
