import type { ArtworkUpload, FulfillmentOrder, JsonRecord } from "@/features/admin/types/database";

export type CustomerProfile = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  account_status: string;
  credits_balance: number;
  subscription_status: string;
  plan_tier: string;
  total_spend_cents: number;
  order_count: number;
  last_order_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CustomerAddress = {
  id: string;
  customer_id: string;
  label: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  country: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
  metadata: JsonRecord;
  created_at: string;
  updated_at: string;
};

export type CustomerNote = {
  id: string;
  customer_id: string;
  author_email: string | null;
  note: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
};

export type CustomerDetail = CustomerProfile & {
  orders: FulfillmentOrder[];
  uploads: ArtworkUpload[];
  addresses: CustomerAddress[];
  customer_notes: CustomerNote[];
};

export type CustomersQuery = {
  search?: string;
  status?: string;
  plan?: string;
  sort?: "newest" | "oldest" | "spend_desc" | "orders_desc";
  page?: number;
  pageSize?: number;
};

export type PaginatedCustomers = {
  customers: CustomerProfile[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};
