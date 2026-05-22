export const discountTypes = ["percentage", "fixed_amount", "free_shipping"] as const;
export const discountStatuses = ["active", "inactive", "expired", "scheduled"] as const;

export type DiscountType = (typeof discountTypes)[number];
export type DiscountStatus = (typeof discountStatuses)[number];

export type Discount = {
  id: string;
  title: string;
  code: string | null;
  discount_type: DiscountType;
  value: number;
  status: DiscountStatus;
  automatic: boolean;
  starts_at: string | null;
  ends_at: string | null;
  usage_limit: number | null;
  usage_count: number;
  once_per_customer: boolean;
  minimum_order_cents: number;
  minimum_quantity: number;
  eligible_customer_ids: string[];
  eligible_product_ids: string[];
  combinable: boolean;
  analytics: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type DiscountRedemption = {
  id: string;
  discount_id: string;
  order_id: string | null;
  customer_id: string | null;
  customer_email: string | null;
  code: string | null;
  discount_amount_cents: number;
  shipping_discount_cents: number;
  currency: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type DiscountsQuery = {
  search?: string;
  status?: DiscountStatus | "all";
  type?: DiscountType | "all";
  page?: number;
  pageSize?: number;
  sort?: "newest" | "oldest" | "usage_desc" | "title_asc";
};

export type PaginatedDiscounts = {
  discounts: Discount[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};

export type DiscountPreviewItem = {
  productId: string;
  quantity: number;
  lineTotalCents: number;
};

export type DiscountCalculationInput = {
  code?: string | null;
  customerId?: string | null;
  customerEmail?: string | null;
  subtotalCents: number;
  shippingCents: number;
  items: DiscountPreviewItem[];
};

export type DiscountCalculationResult = {
  discount: Discount | null;
  discountAmountCents: number;
  shippingDiscountCents: number;
  finalSubtotalCents: number;
  finalShippingCents: number;
  message: string | null;
};
