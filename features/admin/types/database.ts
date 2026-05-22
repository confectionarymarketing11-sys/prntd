export const productionStatuses = ["pending", "approved", "printing", "cutting", "packing", "shipped", "completed"] as const;
export const paymentStatuses = ["unpaid", "authorized", "paid", "refunded", "failed"] as const;
export const shipmentStatuses = ["not_started", "label_created", "in_transit", "delivered", "exception", "returned"] as const;

export type ProductionStatus = (typeof productionStatuses)[number];
export type PaymentStatus = (typeof paymentStatuses)[number];
export type ShipmentStatus = (typeof shipmentStatuses)[number];

export type JsonRecord = Record<string, unknown>;

export type AdminUser = {
  id: string;
  user_id: string;
  email: string;
  role: "owner" | "manager" | "fulfillment" | "viewer";
  active: boolean;
  created_at: string;
};

export type Customer = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
  customization: JsonRecord;
  production_notes: string | null;
  created_at: string;
};

export type ArtworkUpload = {
  id: string;
  order_id: string | null;
  order_item_id: string | null;
  customer_id: string | null;
  design_id: string | null;
  file_name: string | null;
  file_url: string | null;
  preview_url: string | null;
  mime_type: string | null;
  file_size: number | null;
  dpi: number | null;
  upload_status: string;
  created_at: string;
};

export type Shipment = {
  id: string;
  order_id: string;
  provider: "shippo" | "shipstation" | "easypost" | "canada_post" | "manual" | null;
  tracking_number: string | null;
  tracking_url: string | null;
  label_url: string | null;
  shipping_cost_cents: number | null;
  shipment_status: ShipmentStatus;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
};

export type ProductionEvent = {
  id: string;
  order_id: string;
  status: ProductionStatus;
  notes: string | null;
  changed_by: string | null;
  created_at: string;
};

export type FulfillmentOrder = {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_address: JsonRecord;
  billing_address: JsonRecord | null;
  production_status: ProductionStatus;
  payment_status: PaymentStatus;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  notes: string | null;
  source: "storefront" | "shopify" | "manual" | "api";
  external_order_id: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer | null;
  order_items?: OrderItem[];
  uploads?: ArtworkUpload[];
  shipments?: Shipment[];
  production_status_events?: ProductionEvent[];
};

export type OrdersQuery = {
  search?: string;
  status?: ProductionStatus | "all";
  payment?: PaymentStatus | "all";
  sort?: "newest" | "oldest" | "total_desc" | "total_asc";
  page?: number;
  pageSize?: number;
};

export type PaginatedOrders = {
  orders: FulfillmentOrder[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};
