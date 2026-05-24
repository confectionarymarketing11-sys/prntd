"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/features/admin/data/auth";
import { createProduct, setProductStatus, updateProduct } from "@/features/products/data/products";
import { inventoryPolicies, productStatuses, productVisibilities } from "@/features/products/types/product";
import type { ProductFormImage, ProductFormVariant, ProductStatus } from "@/features/products/types/product";

const variantSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1).default("Default Title"),
  sku: z.string().trim().optional(),
  price_cents: z.coerce.number().int().min(0),
  inventory_quantity: z.coerce.number().int(),
  inventory_policy: z.enum(inventoryPolicies),
  option1_name: z.string().trim().optional(),
  option1_value: z.string().trim().optional(),
  option2_name: z.string().trim().optional(),
  option2_value: z.string().trim().optional(),
  option3_name: z.string().trim().optional(),
  option3_value: z.string().trim().optional(),
  active: z.coerce.boolean(),
});

const imageSchema = z.object({
  id: z.string().optional(),
  url: z.string().trim().url(),
  alt_text: z.string().trim().optional(),
  is_featured: z.coerce.boolean(),
  position: z.coerce.number().int().min(0),
});

const productFormSchema = z.object({
  title: z.string().trim().min(1, "Product title is required."),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional(),
  status: z.enum(productStatuses),
  visibility: z.enum(productVisibilities),
  product_type: z.string().trim().optional(),
  vendor: z.string().trim().optional(),
  tags: z.string().trim().optional(),
  featured_image_url: z.string().trim().optional(),
  price: z.coerce.number().min(0),
  compare_at_price: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
  currency: z.string().trim().min(3).max(3).default("CAD"),
  seo_title: z.string().trim().optional(),
  seo_description: z.string().trim().optional(),
  variants: z.array(variantSchema),
  images: z.array(imageSchema),
});

function parseJsonArray<T>(value: FormDataEntryValue | null, fallback: T[]) {
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function dollarsToCents(value: number) {
  return Math.round(value * 100);
}

function parseProductForm(formData: FormData) {
  const parsed = productFormSchema.parse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    status: formData.get("status"),
    visibility: formData.get("visibility"),
    product_type: formData.get("product_type"),
    vendor: formData.get("vendor"),
    tags: formData.get("tags"),
    featured_image_url: formData.get("featured_image_url"),
    price: formData.get("price"),
    compare_at_price: formData.get("compare_at_price") || "",
    currency: formData.get("currency") || "CAD",
    seo_title: formData.get("seo_title"),
    seo_description: formData.get("seo_description"),
    variants: parseJsonArray<ProductFormVariant>(formData.get("variants"), []),
    images: parseJsonArray<ProductFormImage>(formData.get("images"), []),
  });

  const variants = parsed.variants.map((variant) => ({
    ...variant,
    title: variant.title || "Default Title",
    sku: variant.sku || undefined,
    option1_name: variant.option1_name || undefined,
    option1_value: variant.option1_value || undefined,
    option2_name: variant.option2_name || undefined,
    option2_value: variant.option2_value || undefined,
    option3_name: variant.option3_name || undefined,
    option3_value: variant.option3_value || undefined,
  }));

  return {
    ...parsed,
    featured_image_url: parsed.featured_image_url || undefined,
    price_cents: dollarsToCents(parsed.price),
    compare_at_price_cents: parsed.compare_at_price === "" || parsed.compare_at_price == null ? null : dollarsToCents(parsed.compare_at_price),
    variants,
  };
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();

  const input = parseProductForm(formData);
  const productId = await createProduct(input);

  revalidatePath("/admin/products");
  redirect(`/admin/products/${productId}`);
}

export async function updateProductAction(formData: FormData) {
  await requireAdmin();

  const productId = String(formData.get("productId") ?? "");
  if (!productId) throw new Error("Missing product id.");

  const input = parseProductForm(formData);
  await updateProduct(productId, input);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
}

export async function setProductStatusAction(formData: FormData) {
  await requireAdmin();

  const productId = String(formData.get("productId") ?? "");
  const status = String(formData.get("status") ?? "") as ProductStatus;

  if (!productId) throw new Error("Missing product id.");
  if (!productStatuses.includes(status)) throw new Error("Invalid product status.");

  await setProductStatus(productId, status);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
}
