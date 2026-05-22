import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  FulfillmentOrder,
  OrdersQuery,
  PaginatedOrders,
  PaymentStatus,
  ProductionStatus,
} from "@/features/admin/types/database";

const DEFAULT_PAGE_SIZE = 20;

function cents(value: number | null | undefined) {
  return Number(value ?? 0);
}

export function formatCents(value: number, currency = "CAD") {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(value / 100);
}

export async function getOrderMetrics() {
  const supabase = createSupabaseAdminClient();
  const [{ count: openCount }, { count: shippedCount }, { data: revenueData }] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .neq("production_status", "completed"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("production_status", ["shipped", "completed"]),
    supabase.from("orders").select("total_cents").eq("payment_status", "paid"),
  ]);

  const paidRevenue = (revenueData ?? []).reduce((sum, row) => sum + cents((row as { total_cents?: number }).total_cents), 0);

  return {
    openCount: openCount ?? 0,
    shippedCount: shippedCount ?? 0,
    paidRevenue,
  };
}

export async function getOrders(query: OrdersQuery): Promise<PaginatedOrders> {
  const supabase = createSupabaseAdminClient();
  const page = Math.max(Number(query.page ?? 1), 1);
  const pageSize = Math.min(Math.max(Number(query.pageSize ?? DEFAULT_PAGE_SIZE), 5), 100);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let request = supabase
    .from("orders")
    .select(
      `
        *,
        customer:customers(*),
        order_items(id, product_name, quantity, line_total_cents),
        shipments(*)
      `,
      { count: "exact" }
    );

  if (query.status && query.status !== "all") {
    request = request.eq("production_status", query.status);
  }

  if (query.payment && query.payment !== "all") {
    request = request.eq("payment_status", query.payment);
  }

  if (query.search?.trim()) {
    const term = query.search.trim();
    request = request.or(`order_number.ilike.%${term}%,customer_email.ilike.%${term}%,customer_name.ilike.%${term}%`);
  }

  switch (query.sort) {
    case "oldest":
      request = request.order("created_at", { ascending: true });
      break;
    case "total_desc":
      request = request.order("total_cents", { ascending: false });
      break;
    case "total_asc":
      request = request.order("total_cents", { ascending: true });
      break;
    default:
      request = request.order("created_at", { ascending: false });
  }

  const { data, error, count } = await request.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    orders: (data ?? []) as FulfillmentOrder[],
    page,
    pageSize,
    total,
    pageCount: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export async function getOrderById(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
        *,
        customer:customers(*),
        order_items(*),
        uploads(*),
        shipments(*),
        production_status_events:production_status_history(*)
      `
    )
    .eq("id", id)
    .single<FulfillmentOrder>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateOrderStatus(orderId: string, status: ProductionStatus, changedBy: string, note?: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({ production_status: status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) {
    throw new Error(error.message);
  }

  const { error: eventError } = await supabase.from("production_status_history").insert({
    order_id: orderId,
    status,
    notes: note || null,
    changed_by: changedBy,
  });

  if (eventError) {
    throw new Error(eventError.message);
  }
}

export async function updatePaymentStatus(orderId: string, status: PaymentStatus) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("orders").update({ payment_status: status, updated_at: new Date().toISOString() }).eq("id", orderId);

  if (error) {
    throw new Error(error.message);
  }
}
