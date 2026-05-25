"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/admin/data/auth";
import { updateShippingRates } from "@/features/shipping/data/shipping";
import type {
  ShippingMethodType,
  ShippingRateInput,
} from "@/features/shipping/types/shipping";
import type { ShippingMethodCode } from "@/data/shop";

const allowedCodes = ["lettermail", "tracked", "local_pickup"] as const;
const allowedMethodTypes = ["lettermail", "tracked", "local_pickup"] as const;

function value(formData: FormData, key: string) {
  const raw = formData.get(key);

  return typeof raw === "string" ? raw.trim() : "";
}

function parseCents(raw: string) {
  const normalized = raw.replace(/[^0-9.]/g, "");
  const amount = Number(normalized || 0);

  if (!Number.isFinite(amount) || amount < 0) return 0;

  return Math.round(amount * 100);
}

function parseNullableCents(raw: string) {
  if (!raw.trim()) return null;

  return parseCents(raw);
}

function isShippingCode(code: string): code is ShippingMethodCode {
  return allowedCodes.includes(code as ShippingMethodCode);
}

function isMethodType(type: string): type is ShippingMethodType {
  return allowedMethodTypes.includes(type as ShippingMethodType);
}

function shippingRatesFromFormData(formData: FormData) {
  const codes = formData.getAll("shipping_code");

  return codes
    .map((rawCode, index): ShippingRateInput | null => {
      const code = typeof rawCode === "string" ? rawCode.trim() : "";

      if (!isShippingCode(code)) return null;

      const methodType = value(formData, `shipping_method_type_${index}`);

      return {
        code,
        name: value(formData, `shipping_name_${index}`) || code,
        description: value(formData, `shipping_description_${index}`) || null,
        amount_cents: parseCents(value(formData, `shipping_amount_${index}`)),
        currency: "CAD",
        method_type: isMethodType(methodType) ? methodType : code,
        min_subtotal_cents: parseCents(value(formData, `shipping_min_subtotal_${index}`)),
        free_over_cents: parseNullableCents(value(formData, `shipping_free_over_${index}`)),
        requires_tracking: formData.getAll(`shipping_requires_tracking_${index}`).includes("on"),
        active: formData.getAll(`shipping_active_${index}`).includes("on"),
      };
    })
    .filter((rate): rate is ShippingRateInput => Boolean(rate));
}

export async function updateShippingRatesFromFormData(formData: FormData) {
  const rates = shippingRatesFromFormData(formData);

  if (!rates.length) return;

  await updateShippingRates(rates);
}

export async function updateShippingRatesAction(formData: FormData) {
  await requireAdmin();
  await updateShippingRatesFromFormData(formData);

  revalidatePath("/admin/settings");
  revalidatePath("/cart");
}
