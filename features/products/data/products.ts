import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  PaginatedProducts,
  ProductFormImage,
  ProductFormVariant,
  ProductListItem,
  ProductMetricSummary,
  ProductsQuery,
  ProductStatus,
  ProductVariant,
  ProductVisibility,
} from "@/features/products/types/product";

const DEFAULT_PAGE_SIZE = 20;

export function formatProductCents(value: number, _currency = "CAD") {
  void _currency;
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(value / 100);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizeTags(value: string | string[] | null | undefined) {
  if (Array.isArray(value)) {
    return value.map((tag) => tag.trim()).filter(Boolean);
  }

  return String(value ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function getProductInventory(product: Pick<ProductListItem, "variants">) {
  return (product.variants ?? []).reduce((sum, variant) => sum + Number(variant.inventory_quantity ?? 0), 0);
}

async function ensureUniqueSlug(baseSlug: string, productId?: string) {
  const supabase = createSupabaseAdminClient();
  const fallback = baseSlug || "product";
  let nextSlug = fallback;
  let attempt = 1;

  while (attempt < 50) {
    let request = supabase.from("products").select("id").eq("slug", nextSlug).limit(1);

    if (productId) {
      request = request.neq("id", productId);
    }

    const { data, error } = await request.maybeSingle<{ id: string }>();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return nextSlug;
    }

    attempt += 1;
    nextSlug = `${fallback}-${attempt}`;
  }

  return `${fallback}-${Date.now()}`;
}

export async function getProductMetrics(): Promise<ProductMetricSummary> {
  const supabase = createSupabaseAdminClient();
  const [{ count: total }, { count: active }, { count: draft }, { data: variants }] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("product_variants").select("product_id, inventory_quantity").lte("inventory_quantity", 5).eq("active", true),
  ]);

  const lowInventory = new Set((variants ?? []).map((variant) => (variant as { product_id: string }).product_id)).size;

  return {
    total: total ?? 0,
    active: active ?? 0,
    draft: draft ?? 0,
    lowInventory,
  };
}

export async function getProducts(query: ProductsQuery): Promise<PaginatedProducts> {
  const supabase = createSupabaseAdminClient();
  const page = Math.max(Number(query.page ?? 1), 1);
  const pageSize = Math.min(Math.max(Number(query.pageSize ?? DEFAULT_PAGE_SIZE), 5), 100);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let request = supabase
    .from("products")
    .select(
      `
        *,
        variants:product_variants(*),
        images:product_images(*)
      `,
      { count: "exact" }
    );

  if (query.status && query.status !== "all") {
    request = request.eq("status", query.status);
  }

  if (query.visibility && query.visibility !== "all") {
    request = request.eq("visibility", query.visibility);
  }

  if (query.search?.trim()) {
    const term = query.search.trim();
    request = request.or(`title.ilike.%${term}%,slug.ilike.%${term}%,product_type.ilike.%${term}%,vendor.ilike.%${term}%`);
  }

  switch (query.sort) {
    case "oldest":
      request = request.order("created_at", { ascending: true });
      break;
    case "title_asc":
      request = request.order("title", { ascending: true });
      break;
    case "title_desc":
      request = request.order("title", { ascending: false });
      break;
    case "price_desc":
      request = request.order("price_cents", { ascending: false });
      break;
    case "price_asc":
      request = request.order("price_cents", { ascending: true });
      break;
    default:
      request = request.order("created_at", { ascending: false });
  }

  const { data, error, count } = await request.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  let products = ((data ?? []) as ProductListItem[]).map((product) => ({
    ...product,
    variants: [...(product.variants ?? [])].sort((a, b) => a.position - b.position),
    images: [...(product.images ?? [])].sort((a, b) => a.position - b.position),
  }));

  if (query.sort === "inventory_asc") {
    products = products.sort((a, b) => getProductInventory(a) - getProductInventory(b));
  }

  const total = count ?? 0;

  return {
    products,
    page,
    pageSize,
    total,
    pageCount: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export async function getProductById(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
        *,
        variants:product_variants(*),
        images:product_images(*)
      `
    )
    .eq("id", id)
    .single<ProductListItem>();

  if (error) {
    throw new Error(error.message);
  }

  return {
    ...data,
    variants: [...(data.variants ?? [])].sort((a, b) => a.position - b.position),
    images: [...(data.images ?? [])].sort((a, b) => a.position - b.position),
  };
}

export async function createProduct(input: {
  title: string;
  slug?: string;
  description?: string;
  status: ProductStatus;
  visibility: ProductVisibility;
  product_type?: string;
  vendor?: string;
  tags?: string | string[];
  featured_image_url?: string;
  price_cents: number;
  compare_at_price_cents?: number | null;
  currency: string;
  seo_title?: string;
  seo_description?: string;
  variants: ProductFormVariant[];
  images: ProductFormImage[];
}) {
  const supabase = createSupabaseAdminClient();
  const slug = await ensureUniqueSlug(slugify(input.slug || input.title));
  const now = new Date().toISOString();

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      title: input.title,
      slug,
      description: input.description || null,
      status: input.status,
      visibility: input.visibility,
      product_type: input.product_type || null,
      vendor: input.vendor || null,
      tags: normalizeTags(input.tags),
      featured_image_url: input.featured_image_url || input.images.find((image) => image.is_featured)?.url || input.images[0]?.url || null,
      price_cents: input.price_cents,
      compare_at_price_cents: input.compare_at_price_cents ?? null,
      currency: input.currency || "CAD",
      seo_title: input.seo_title || null,
      seo_description: input.seo_description || null,
      published_at: input.status === "active" ? now : null,
      archived_at: input.status === "archived" ? now : null,
    })
    .select("id")
    .single<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  await replaceProductVariants(product.id, input.variants.length ? input.variants : [defaultVariant(input.price_cents)]);
  await replaceProductImages(product.id, input.images);

  return product.id;
}

export async function updateProduct(
  productId: string,
  input: {
    title: string;
    slug?: string;
    description?: string;
    status: ProductStatus;
    visibility: ProductVisibility;
    product_type?: string;
    vendor?: string;
    tags?: string | string[];
    featured_image_url?: string;
    price_cents: number;
    compare_at_price_cents?: number | null;
    currency: string;
    seo_title?: string;
    seo_description?: string;
    variants: ProductFormVariant[];
    images: ProductFormImage[];
  }
) {
  const supabase = createSupabaseAdminClient();
  const slug = await ensureUniqueSlug(slugify(input.slug || input.title), productId);
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("products")
    .update({
      title: input.title,
      slug,
      description: input.description || null,
      status: input.status,
      visibility: input.visibility,
      product_type: input.product_type || null,
      vendor: input.vendor || null,
      tags: normalizeTags(input.tags),
      featured_image_url: input.featured_image_url || input.images.find((image) => image.is_featured)?.url || input.images[0]?.url || null,
      price_cents: input.price_cents,
      compare_at_price_cents: input.compare_at_price_cents ?? null,
      currency: input.currency || "CAD",
      seo_title: input.seo_title || null,
      seo_description: input.seo_description || null,
      published_at: input.status === "active" ? now : null,
      archived_at: input.status === "archived" ? now : null,
    })
    .eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }

  await replaceProductVariants(productId, input.variants.length ? input.variants : [defaultVariant(input.price_cents)]);
  await replaceProductImages(productId, input.images);
}

export async function setProductStatus(productId: string, status: ProductStatus) {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("products")
    .update({
      status,
      visibility: status === "active" ? "online" : status === "archived" ? "hidden" : undefined,
      published_at: status === "active" ? now : null,
      archived_at: status === "archived" ? now : null,
    })
    .eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }
}

function defaultVariant(priceCents: number): ProductFormVariant {
  return {
    title: "Default Title",
    price_cents: priceCents,
    inventory_quantity: 0,
    inventory_policy: "deny",
    active: true,
  };
}

async function replaceProductVariants(productId: string, variants: ProductFormVariant[]) {
  const supabase = createSupabaseAdminClient();
  const { error: deleteError } = await supabase.from("product_variants").delete().eq("product_id", productId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const rows = variants.map((variant, index) => ({
    product_id: productId,
    title: variant.title || "Default Title",
    sku: variant.sku || null,
    option1_name: variant.option1_name || null,
    option1_value: variant.option1_value || null,
    option2_name: variant.option2_name || null,
    option2_value: variant.option2_value || null,
    price_cents: Number(variant.price_cents ?? 0),
    inventory_quantity: Number(variant.inventory_quantity ?? 0),
    inventory_policy: variant.inventory_policy || "deny",
    active: Boolean(variant.active),
    position: index,
  }));

  const { error } = await supabase.from("product_variants").insert(rows);

  if (error) {
    throw new Error(error.message);
  }
}

async function replaceProductImages(productId: string, images: ProductFormImage[]) {
  const supabase = createSupabaseAdminClient();
  const { error: deleteError } = await supabase.from("product_images").delete().eq("product_id", productId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const rows = images
    .filter((image) => image.url.trim())
    .map((image, index) => ({
      product_id: productId,
      url: image.url.trim(),
      alt_text: image.alt_text || null,
      is_featured: Boolean(image.is_featured),
      position: index,
    }));

  if (!rows.length) {
    return;
  }

  const { error } = await supabase.from("product_images").insert(rows);

  if (error) {
    throw new Error(error.message);
  }
}

export function productToFormDefaults(product?: ProductListItem) {
  return {
    title: product?.title ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    status: product?.status ?? "draft",
    visibility: product?.visibility ?? "hidden",
    productType: product?.product_type ?? "",
    vendor: product?.vendor ?? "",
    tags: product?.tags?.join(", ") ?? "",
    featuredImageUrl: product?.featured_image_url ?? "",
    price: ((product?.price_cents ?? 0) / 100).toFixed(2),
    compareAtPrice: product?.compare_at_price_cents ? (product.compare_at_price_cents / 100).toFixed(2) : "",
    currency: product?.currency ?? "CAD",
    seoTitle: product?.seo_title ?? "",
    seoDescription: product?.seo_description ?? "",
    variants: ((product?.variants ?? []) as ProductVariant[]).map((variant) => ({
      id: variant.id,
      title: variant.title,
      sku: variant.sku ?? "",
      price_cents: variant.price_cents,
      inventory_quantity: variant.inventory_quantity,
      inventory_policy: variant.inventory_policy,
      option1_name: variant.option1_name ?? "",
      option1_value: variant.option1_value ?? "",
      option2_name: variant.option2_name ?? "",
      option2_value: variant.option2_value ?? "",
      active: variant.active,
    })),
    images: (product?.images ?? []).map((image) => ({
      id: image.id,
      url: image.url,
      alt_text: image.alt_text ?? "",
      is_featured: image.is_featured,
      position: image.position,
    })),
  };
}
