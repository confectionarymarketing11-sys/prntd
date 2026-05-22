import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  Discount,
  DiscountCalculationInput,
  DiscountCalculationResult,
  DiscountsQuery,
  DiscountStatus,
  DiscountType,
  PaginatedDiscounts,
} from "@/features/discounts/types/discount";
import { formatProductCents } from "@/features/products/data/products";

const DEFAULT_PAGE_SIZE = 20;

export function formatDiscountValue(discount: Pick<Discount, "discount_type" | "value">) {
  if (discount.discount_type === "percentage") return `${discount.value}%`;
  if (discount.discount_type === "free_shipping") return "Free shipping";
  return formatProductCents(discount.value);
}

export async function getDiscounts(query: DiscountsQuery): Promise<PaginatedDiscounts> {
  const supabase = createSupabaseAdminClient();
  const page = Math.max(Number(query.page ?? 1), 1);
  const pageSize = Math.min(Math.max(Number(query.pageSize ?? DEFAULT_PAGE_SIZE), 5), 100);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let request = supabase.from("discounts").select("*", { count: "exact" });

  if (query.status && query.status !== "all") request = request.eq("status", query.status);
  if (query.type && query.type !== "all") request = request.eq("discount_type", query.type);

  if (query.search?.trim()) {
    const term = query.search.trim();
    request = request.or(`title.ilike.%${term}%,code.ilike.%${term}%`);
  }

  switch (query.sort) {
    case "oldest":
      request = request.order("created_at", { ascending: true });
      break;
    case "usage_desc":
      request = request.order("usage_count", { ascending: false });
      break;
    case "title_asc":
      request = request.order("title", { ascending: true });
      break;
    default:
      request = request.order("created_at", { ascending: false });
  }

  const { data, error, count } = await request.range(from, to);
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    discounts: (data ?? []) as Discount[],
    page,
    pageSize,
    total,
    pageCount: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export async function getDiscountMetrics() {
  const supabase = createSupabaseAdminClient();
  const [{ count: active }, { count: automatic }, { data: redemptions }] = await Promise.all([
    supabase.from("discounts").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("discounts").select("id", { count: "exact", head: true }).eq("automatic", true),
    supabase.from("discount_redemptions").select("discount_amount_cents, shipping_discount_cents"),
  ]);

  const totalDiscountedCents = (redemptions ?? []).reduce(
    (sum, row) =>
      sum +
      Number((row as { discount_amount_cents?: number }).discount_amount_cents ?? 0) +
      Number((row as { shipping_discount_cents?: number }).shipping_discount_cents ?? 0),
    0
  );

  return {
    active: active ?? 0,
    automatic: automatic ?? 0,
    redemptions: redemptions?.length ?? 0,
    totalDiscountedCents,
  };
}

export async function getDiscountById(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("discounts").select("*").eq("id", id).single<Discount>();
  if (error) throw new Error(error.message);
  return data;
}

export async function getDiscountRedemptions(discountId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("discount_redemptions")
    .select("*, customer:customers(id,email,name), order:orders(id,order_number,total_cents)")
    .eq("discount_id", discountId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createDiscount(input: DiscountMutationInput) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("discounts").insert(normalizeDiscountInput(input)).select("id").single<{ id: string }>();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function updateDiscount(id: string, input: DiscountMutationInput) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("discounts").update(normalizeDiscountInput(input)).eq("id", id);
  if (error) throw new Error(error.message);
}

export type DiscountMutationInput = {
  title: string;
  code?: string | null;
  discount_type: DiscountType;
  value: number;
  status: DiscountStatus;
  automatic: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  usage_limit?: number | null;
  once_per_customer: boolean;
  minimum_order_cents: number;
  minimum_quantity: number;
  eligible_customer_ids?: string[];
  eligible_product_ids?: string[];
  combinable: boolean;
};

function normalizeDiscountInput(input: DiscountMutationInput) {
  return {
    title: input.title,
    code: input.code ? input.code.trim().toUpperCase() : null,
    discount_type: input.discount_type,
    value: input.value,
    status: input.status,
    automatic: input.automatic,
    starts_at: input.starts_at || null,
    ends_at: input.ends_at || null,
    usage_limit: input.usage_limit ?? null,
    once_per_customer: input.once_per_customer,
    minimum_order_cents: input.minimum_order_cents,
    minimum_quantity: input.minimum_quantity,
    eligible_customer_ids: input.eligible_customer_ids ?? [],
    eligible_product_ids: input.eligible_product_ids ?? [],
    combinable: input.combinable,
  };
}

export async function calculateDiscount(input: DiscountCalculationInput): Promise<DiscountCalculationResult> {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const totalQuantity = input.items.reduce((sum, item) => sum + item.quantity, 0);

  let request = supabase.from("discounts").select("*").eq("status", "active");

  if (input.code?.trim()) {
    request = request.eq("code", input.code.trim().toUpperCase());
  } else {
    request = request.eq("automatic", true);
  }

  const { data, error } = await request
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("automatic", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(input.code ? 1 : 10);

  if (error) {
    throw new Error(error.message);
  }

  const candidates = ((data ?? []) as Discount[]).filter((discount) => {
    if (discount.usage_limit != null && discount.usage_count >= discount.usage_limit) return false;
    if (input.subtotalCents < discount.minimum_order_cents) return false;
    if (totalQuantity < discount.minimum_quantity) return false;
    if (discount.eligible_customer_ids.length && (!input.customerId || !discount.eligible_customer_ids.includes(input.customerId))) return false;
    if (discount.eligible_product_ids.length && !input.items.some((item) => discount.eligible_product_ids.includes(item.productId))) return false;
    return true;
  });

  for (const discount of candidates) {
    if (discount.once_per_customer && (input.customerId || input.customerEmail)) {
      let redemptionRequest = supabase.from("discount_redemptions").select("id", { count: "exact", head: true }).eq("discount_id", discount.id);
      if (input.customerId) redemptionRequest = redemptionRequest.eq("customer_id", input.customerId);
      else if (input.customerEmail) redemptionRequest = redemptionRequest.eq("customer_email", input.customerEmail);

      const { count } = await redemptionRequest;
      if ((count ?? 0) > 0) continue;
    }

    const discountAmountCents =
      discount.discount_type === "percentage"
        ? Math.min(input.subtotalCents, Math.round(input.subtotalCents * (discount.value / 100)))
        : discount.discount_type === "fixed_amount"
          ? Math.min(input.subtotalCents, discount.value)
          : 0;

    const shippingDiscountCents = discount.discount_type === "free_shipping" ? input.shippingCents : 0;

    return {
      discount,
      discountAmountCents,
      shippingDiscountCents,
      finalSubtotalCents: Math.max(input.subtotalCents - discountAmountCents, 0),
      finalShippingCents: Math.max(input.shippingCents - shippingDiscountCents, 0),
      message: null,
    };
  }

  return {
    discount: null,
    discountAmountCents: 0,
    shippingDiscountCents: 0,
    finalSubtotalCents: input.subtotalCents,
    finalShippingCents: input.shippingCents,
    message: input.code ? "Discount code is invalid or not eligible for this order." : null,
  };
}

export async function recordDiscountRedemption(input: {
  discountId: string;
  orderId?: string | null;
  customerId?: string | null;
  customerEmail?: string | null;
  code?: string | null;
  discountAmountCents: number;
  shippingDiscountCents: number;
  currency?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("discount_redemptions").insert({
    discount_id: input.discountId,
    order_id: input.orderId ?? null,
    customer_id: input.customerId ?? null,
    customer_email: input.customerEmail ?? null,
    code: input.code ?? null,
    discount_amount_cents: input.discountAmountCents,
    shipping_discount_cents: input.shippingDiscountCents,
    currency: input.currency ?? "CAD",
    metadata: input.metadata ?? {},
  });
  if (error) throw new Error(error.message);

  await supabase.rpc("increment_discount_usage", { discount_id_input: input.discountId }).then(async ({ error: rpcError }) => {
    if (!rpcError) return;
    const { data } = await supabase.from("discounts").select("usage_count").eq("id", input.discountId).single<{ usage_count: number }>();
    await supabase.from("discounts").update({ usage_count: Number(data?.usage_count ?? 0) + 1 }).eq("id", input.discountId);
  });
}
