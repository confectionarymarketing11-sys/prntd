import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AnalyticsSummary, DateRangeKey, TimeSeriesPoint, TopCustomerMetric, TopProductMetric } from "@/features/analytics/types/analytics";

function daysForRange(range: DateRangeKey) {
  if (range === "7d") return 7;
  if (range === "90d") return 90;
  return 30;
}

function dateKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

export async function getAnalytics(range: DateRangeKey): Promise<AnalyticsSummary> {
  const supabase = createSupabaseAdminClient();
  const days = daysForRange(range);
  const start = new Date();
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);

  const [{ data: orders }, { data: orderItems }, { data: events }] = await Promise.all([
    supabase.from("orders").select("*").gte("created_at", start.toISOString()).order("created_at", { ascending: true }),
    supabase.from("order_items").select("product_name, quantity, line_total_cents, created_at").gte("created_at", start.toISOString()),
    supabase.from("production_status_history").select("*").gte("created_at", start.toISOString()).order("created_at", { ascending: false }).limit(12),
  ]);

  const orderRows = (orders ?? []) as Array<{
    id: string;
    customer_id: string | null;
    customer_email: string;
    customer_name: string | null;
    total_cents: number;
    payment_status: string;
    production_status: string;
    created_at: string;
  }>;

  const paidOrders = orderRows.filter((order) => order.payment_status === "paid");
  const revenueCents = paidOrders.reduce((sum, order) => sum + Number(order.total_cents ?? 0), 0);
  const averageOrderValueCents = paidOrders.length ? Math.round(revenueCents / paidOrders.length) : 0;
  const openFulfillment = orderRows.filter((order) => !["shipped", "completed"].includes(order.production_status)).length;
  const shippedOrders = orderRows.filter((order) => ["shipped", "completed"].includes(order.production_status)).length;

  const productionBreakdown = orderRows.reduce<Record<string, number>>((acc, order) => {
    acc[order.production_status] = (acc[order.production_status] ?? 0) + 1;
    return acc;
  }, {});

  const seriesMap = new Map<string, TimeSeriesPoint>();
  for (let i = 0; i < days; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = date.toISOString().slice(0, 10);
    seriesMap.set(key, { label: key.slice(5), revenueCents: 0, orders: 0 });
  }
  paidOrders.forEach((order) => {
    const key = dateKey(order.created_at);
    const point = seriesMap.get(key);
    if (!point) return;
    point.revenueCents += Number(order.total_cents ?? 0);
    point.orders += 1;
  });

  const productMap = new Map<string, TopProductMetric>();
  (orderItems ?? []).forEach((item) => {
    const row = item as { product_name: string; quantity: number; line_total_cents: number };
    const existing = productMap.get(row.product_name) ?? { productName: row.product_name, quantity: 0, revenueCents: 0 };
    existing.quantity += Number(row.quantity ?? 0);
    existing.revenueCents += Number(row.line_total_cents ?? 0);
    productMap.set(row.product_name, existing);
  });

  const customerMap = new Map<string, TopCustomerMetric>();
  paidOrders.forEach((order) => {
    const key = order.customer_id ?? order.customer_email;
    const existing = customerMap.get(key) ?? {
      customerId: order.customer_id,
      customerEmail: order.customer_email,
      customerName: order.customer_name,
      totalCents: 0,
      orderCount: 0,
    };
    existing.totalCents += Number(order.total_cents ?? 0);
    existing.orderCount += 1;
    customerMap.set(key, existing);
  });

  return {
    revenueCents,
    paidOrders: paidOrders.length,
    averageOrderValueCents,
    openFulfillment,
    shippedOrders,
    productionBreakdown,
    revenueSeries: Array.from(seriesMap.values()),
    topProducts: Array.from(productMap.values()).sort((a, b) => b.revenueCents - a.revenueCents).slice(0, 8),
    topCustomers: Array.from(customerMap.values()).sort((a, b) => b.totalCents - a.totalCents).slice(0, 8),
    recentActivity: (events ?? []).map((event) => {
      const row = event as { id: string; status: string; order_id: string; created_at: string };
      return {
        id: row.id,
        label: row.status,
        detail: `Order ${row.order_id}`,
        createdAt: row.created_at,
      };
    }),
  };
}
