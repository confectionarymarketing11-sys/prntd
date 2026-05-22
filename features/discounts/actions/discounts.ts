"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/features/admin/data/auth";
import { createDiscount, updateDiscount } from "@/features/discounts/data/discounts";
import { discountStatuses, discountTypes } from "@/features/discounts/types/discount";

const discountFormSchema = z.object({
  title: z.string().trim().min(1),
  code: z.string().trim().optional(),
  discount_type: z.enum(discountTypes),
  value: z.coerce.number().min(0),
  status: z.enum(discountStatuses),
  automatic: z.coerce.boolean(),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  usage_limit: z.union([z.coerce.number().int().positive(), z.literal("")]).optional(),
  once_per_customer: z.coerce.boolean(),
  minimum_order: z.coerce.number().min(0),
  minimum_quantity: z.coerce.number().int().min(0),
  eligible_customer_ids: z.string().optional(),
  eligible_product_ids: z.string().optional(),
  combinable: z.coerce.boolean(),
});

function dollarsToCents(value: number) {
  return Math.round(value * 100);
}

function splitList(value?: string) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseForm(formData: FormData) {
  const parsed = discountFormSchema.parse({
    title: formData.get("title"),
    code: formData.get("code"),
    discount_type: formData.get("discount_type"),
    value: formData.get("value"),
    status: formData.get("status"),
    automatic: formData.get("automatic") === "on",
    starts_at: formData.get("starts_at") || "",
    ends_at: formData.get("ends_at") || "",
    usage_limit: formData.get("usage_limit") || "",
    once_per_customer: formData.get("once_per_customer") === "on",
    minimum_order: formData.get("minimum_order") || 0,
    minimum_quantity: formData.get("minimum_quantity") || 0,
    eligible_customer_ids: formData.get("eligible_customer_ids"),
    eligible_product_ids: formData.get("eligible_product_ids"),
    combinable: formData.get("combinable") === "on",
  });

  return {
    title: parsed.title,
    code: parsed.automatic ? null : parsed.code || null,
    discount_type: parsed.discount_type,
    value: parsed.discount_type === "percentage" ? Math.round(parsed.value) : dollarsToCents(parsed.value),
    status: parsed.status,
    automatic: parsed.automatic,
    starts_at: parsed.starts_at ? new Date(parsed.starts_at).toISOString() : null,
    ends_at: parsed.ends_at ? new Date(parsed.ends_at).toISOString() : null,
    usage_limit: parsed.usage_limit === "" ? null : parsed.usage_limit,
    once_per_customer: parsed.once_per_customer,
    minimum_order_cents: dollarsToCents(parsed.minimum_order),
    minimum_quantity: parsed.minimum_quantity,
    eligible_customer_ids: splitList(parsed.eligible_customer_ids),
    eligible_product_ids: splitList(parsed.eligible_product_ids),
    combinable: parsed.combinable,
  };
}

export async function createDiscountAction(formData: FormData) {
  await requireAdmin();
  const id = await createDiscount(parseForm(formData));
  revalidatePath("/admin/discounts");
  redirect(`/admin/discounts/${id}`);
}

export async function updateDiscountAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("discountId") ?? "");
  if (!id) throw new Error("Missing discount id.");

  await updateDiscount(id, parseForm(formData));
  revalidatePath("/admin/discounts");
  revalidatePath(`/admin/discounts/${id}`);
}
