import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatProductCents } from "@/features/products/data/products";
import type { CustomerDetail, CustomerProfile, CustomersQuery, PaginatedCustomers } from "@/features/customers/types/customer";

const DEFAULT_PAGE_SIZE = 20;

export { formatProductCents as formatCustomerCents };

export async function getCustomers(query: CustomersQuery): Promise<PaginatedCustomers> {
  const supabase = createSupabaseAdminClient();
  const page = Math.max(Number(query.page ?? 1), 1);
  const pageSize = Math.min(Math.max(Number(query.pageSize ?? DEFAULT_PAGE_SIZE), 5), 100);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let request = supabase.from("customers").select("*", { count: "exact" });

  if (query.status && query.status !== "all") request = request.eq("account_status", query.status);
  if (query.plan && query.plan !== "all") request = request.eq("plan_tier", query.plan);
  if (query.search?.trim()) {
    const term = query.search.trim();
    request = request.or(`email.ilike.%${term}%,name.ilike.%${term}%,company.ilike.%${term}%,phone.ilike.%${term}%`);
  }

  switch (query.sort) {
    case "oldest":
      request = request.order("created_at", { ascending: true });
      break;
    case "spend_desc":
      request = request.order("total_spend_cents", { ascending: false });
      break;
    case "orders_desc":
      request = request.order("order_count", { ascending: false });
      break;
    default:
      request = request.order("created_at", { ascending: false });
  }

  const { data, error, count } = await request.range(from, to);
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    customers: (data ?? []) as CustomerProfile[],
    page,
    pageSize,
    total,
    pageCount: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export async function getCustomerMetrics() {
  const supabase = createSupabaseAdminClient();
  const [{ count: total }, { count: active }, { data }] = await Promise.all([
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("customers").select("id", { count: "exact", head: true }).eq("account_status", "active"),
    supabase.from("customers").select("total_spend_cents, order_count"),
  ]);

  return {
    total: total ?? 0,
    active: active ?? 0,
    totalSpendCents: (data ?? []).reduce((sum, row) => sum + Number((row as { total_spend_cents?: number }).total_spend_cents ?? 0), 0),
    totalOrders: (data ?? []).reduce((sum, row) => sum + Number((row as { order_count?: number }).order_count ?? 0), 0),
  };
}

export async function getCustomerById(id: string): Promise<CustomerDetail> {
  const supabase = createSupabaseAdminClient();
  const [{ data: customer, error }, { data: orders }, { data: uploads }, { data: addresses }, { data: notes }] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).single<CustomerProfile>(),
    supabase.from("orders").select("*, order_items(*), shipments(*)").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("uploads").select("*").eq("customer_id", id).order("created_at", { ascending: false }).limit(50),
    supabase.from("customer_addresses").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("customer_notes").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
  ]);

  if (error) throw new Error(error.message);

  return {
    ...customer,
    orders: orders ?? [],
    uploads: uploads ?? [],
    addresses: addresses ?? [],
    customer_notes: notes ?? [],
  } as CustomerDetail;
}

export async function addCustomerNote(input: { customerId: string; authorEmail: string; note: string; pinned?: boolean }) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("customer_notes").insert({
    customer_id: input.customerId,
    author_email: input.authorEmail,
    note: input.note,
    pinned: input.pinned ?? false,
  });
  if (error) throw new Error(error.message);
}
