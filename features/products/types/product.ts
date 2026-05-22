export const productStatuses = ["draft", "active", "archived"] as const;
export const productVisibilities = ["online", "hidden"] as const;
export const inventoryPolicies = ["deny", "continue"] as const;

export type ProductStatus = (typeof productStatuses)[number];
export type ProductVisibility = (typeof productVisibilities)[number];
export type InventoryPolicy = (typeof inventoryPolicies)[number];

export type ProductImage = {
  id: string;
  product_id: string;
  variant_id: string | null;
  url: string;
  storage_path: string | null;
  alt_text: string | null;
  position: number;
  is_featured: boolean;
  width: number | null;
  height: number | null;
  dominant_color: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  title: string;
  sku: string | null;
  barcode: string | null;
  option1_name: string | null;
  option1_value: string | null;
  option2_name: string | null;
  option2_value: string | null;
  option3_name: string | null;
  option3_value: string | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  cost_cents: number | null;
  inventory_quantity: number;
  inventory_policy: InventoryPolicy;
  weight_grams: number | null;
  taxable: boolean;
  active: boolean;
  position: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: ProductStatus;
  visibility: ProductVisibility;
  product_type: string | null;
  vendor: string | null;
  tags: string[];
  featured_image_url: string | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  currency: string;
  seo_title: string | null;
  seo_description: string | null;
  view_count: number;
  conversion_count: number;
  sales_count: number;
  metadata: Record<string, unknown>;
  published_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  variants?: ProductVariant[];
  images?: ProductImage[];
};

export type ProductListItem = Product & {
  variants: ProductVariant[];
  images: ProductImage[];
};

export type ProductsQuery = {
  search?: string;
  status?: ProductStatus | "all";
  visibility?: ProductVisibility | "all";
  sort?: "newest" | "oldest" | "title_asc" | "title_desc" | "price_desc" | "price_asc" | "inventory_asc";
  page?: number;
  pageSize?: number;
};

export type PaginatedProducts = {
  products: ProductListItem[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};

export type ProductMetricSummary = {
  total: number;
  active: number;
  draft: number;
  lowInventory: number;
};

export type ProductFormVariant = {
  id?: string;
  title: string;
  sku?: string;
  price_cents: number;
  inventory_quantity: number;
  inventory_policy: InventoryPolicy;
  option1_name?: string;
  option1_value?: string;
  option2_name?: string;
  option2_value?: string;
  active: boolean;
};

export type ProductFormImage = {
  id?: string;
  url: string;
  alt_text?: string;
  is_featured: boolean;
  position: number;
};
