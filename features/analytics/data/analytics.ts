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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const liveSince = new Date(Date.now() - 5 * 60 * 1000);
  const [{ data: storefrontEvents, error: storefrontError }, { data: todayEvents }, { data: liveEvents }] = await Promise.all([
    supabase.from("storefront_events").select("*").gte("created_at", start.toISOString()).order("created_at", { ascending: true }).limit(5000),
    supabase.from("storefront_events").select("visitor_id, event_type").gte("created_at", today.toISOString()).limit(5000),
    supabase
      .from("storefront_events")
      .select("session_id, visitor_id, customer_email, pathname, event_type, created_at")
      .gte("created_at", liveSince.toISOString())
      .order("created_at", { ascending: false })
      .limit(250),
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
    seriesMap.set(key, { label: key.slice(5), revenueCents: 0, orders: 0, visitors: 0, addedToCart: 0, reachedCheckout: 0, checkoutCompleted: 0 });
  }
  paidOrders.forEach((order) => {
    const key = dateKey(order.created_at);
    const point = seriesMap.get(key);
    if (!point) return;
    point.revenueCents += Number(order.total_cents ?? 0);
    point.orders += 1;
  });

  const eventsAvailable = storefrontError?.code !== "42P01";
  const eventRows = eventsAvailable
    ? ((storefrontEvents ?? []) as Array<{
        event_type: string;
        visitor_id: string;
        session_id: string;
        customer_email: string | null;
        pathname: string | null;
        created_at: string;
      }>)
    : [];
  const dailyVisitorCount = new Set((todayEvents ?? []).map((event) => (event as { visitor_id?: string }).visitor_id).filter(Boolean)).size;
  const addedToCart = eventRows.filter((event) => event.event_type === "added_to_cart").length;
  const reachedCheckout = eventRows.filter((event) => event.event_type === "reached_checkout").length;
  const checkoutCompleted = eventRows.filter((event) => event.event_type === "checkout_completed").length;
  const visitorSeries = new Map<string, Set<string>>();

  for (const event of eventRows) {
    const key = dateKey(event.created_at);
    const point = seriesMap.get(key);
    if (!point) continue;

    if (event.event_type === "page_view") {
      const visitors = visitorSeries.get(key) ?? new Set<string>();
      visitors.add(event.visitor_id);
      visitorSeries.set(key, visitors);
    }
    if (event.event_type === "added_to_cart") point.addedToCart = Number(point.addedToCart ?? 0) + 1;
    if (event.event_type === "reached_checkout") point.reachedCheckout = Number(point.reachedCheckout ?? 0) + 1;
    if (event.event_type === "checkout_completed") point.checkoutCompleted = Number(point.checkoutCompleted ?? 0) + 1;
  }

  for (const [key, visitors] of visitorSeries.entries()) {
    const point = seriesMap.get(key);
    if (point) point.visitors = visitors.size;
  }

  const liveBySession = new Map<
    string,
    { sessionId: string; visitorId: string; pathname: string | null; eventType: string; customerEmail: string | null; lastSeenAt: string }
  >();

  for (const event of (liveEvents ?? []) as Array<{
    session_id: string;
    visitor_id: string;
    customer_email: string | null;
    pathname: string | null;
    event_type: string;
    created_at: string;
  }>) {
    if (liveBySession.has(event.session_id)) continue;
    liveBySession.set(event.session_id, {
      sessionId: event.session_id,
      visitorId: event.visitor_id,
      pathname: event.pathname,
      eventType: event.event_type,
      customerEmail: event.customer_email,
      lastSeenAt: event.created_at,
    });
  }

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
    dailyVisitors: dailyVisitorCount,
    addedToCart,
    reachedCheckout,
    checkoutCompleted,
    conversionRate: dailyVisitorCount ? Math.round((checkoutCompleted / dailyVisitorCount) * 1000) / 10 : 0,
    liveVisitors: Array.from(liveBySession.values()).slice(0, 20),
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
