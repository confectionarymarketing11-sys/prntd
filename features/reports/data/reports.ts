import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type TaxReportRow = {
  month: string;
  orderCount: number;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
};

export function formatReportCents(value: number, currency = "CAD") {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency }).format(value / 100);
}

export async function getTaxReport(year: number) {
  const supabase = createSupabaseAdminClient();
  const start = new Date(Date.UTC(year, 0, 1)).toISOString();
  const end = new Date(Date.UTC(year + 1, 0, 1)).toISOString();
  const { data, error } = await supabase
    .from("orders")
    .select("created_at, subtotal_cents, discount_cents, shipping_cents, shipping_cost_cents, tax_cents, total_cents, currency")
    .gte("created_at", start)
    .lt("created_at", end)
    .eq("payment_status", "paid")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const rows = new Map<string, TaxReportRow>();

  for (let month = 0; month < 12; month += 1) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}`;
    rows.set(key, {
      month: key,
      orderCount: 0,
      subtotalCents: 0,
      discountCents: 0,
      shippingCents: 0,
      taxCents: 0,
      totalCents: 0,
    });
  }

  for (const order of data ?? []) {
    const date = new Date(String(order.created_at));
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const row = rows.get(key);
    if (!row) continue;

    row.orderCount += 1;
    row.subtotalCents += Number(order.subtotal_cents ?? 0);
    row.discountCents += Number(order.discount_cents ?? 0);
    row.shippingCents += Number(order.shipping_cost_cents ?? order.shipping_cents ?? 0);
    row.taxCents += Number(order.tax_cents ?? 0);
    row.totalCents += Number(order.total_cents ?? 0);
  }

  const monthly = Array.from(rows.values());

  return {
    year,
    currency: (data?.[0]?.currency as string | undefined) ?? "CAD",
    monthly,
    totals: monthly.reduce(
      (sum, row) => ({
        month: "Total",
        orderCount: sum.orderCount + row.orderCount,
        subtotalCents: sum.subtotalCents + row.subtotalCents,
        discountCents: sum.discountCents + row.discountCents,
        shippingCents: sum.shippingCents + row.shippingCents,
        taxCents: sum.taxCents + row.taxCents,
        totalCents: sum.totalCents + row.totalCents,
      }),
      {
        month: "Total",
        orderCount: 0,
        subtotalCents: 0,
        discountCents: 0,
        shippingCents: 0,
        taxCents: 0,
        totalCents: 0,
      }
    ),
  };
}
