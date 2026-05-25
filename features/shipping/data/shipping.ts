import {
  SHIPPING_METHODS,
  type CartItem,
  type ShippingMethod,
  getAvailableShippingMethods,
} from "@/data/shop";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ShippingRate, ShippingRateInput } from "@/features/shipping/types/shipping";

const shippingCodeOrder = ["lettermail", "tracked", "local_pickup"];

function fallbackRates(): ShippingRate[] {
  const now = new Date().toISOString();

  return SHIPPING_METHODS.map((method) => ({
    id: method.code,
    profile_id: null,
    code: method.code,
    name: method.name,
    description: method.description,
    amount_cents: Math.round(method.price * 100),
    currency: "CAD",
    method_type: method.code,
    min_subtotal_cents: 0,
    free_over_cents: method.freeOver ? Math.round(method.freeOver * 100) : null,
    requires_tracking: method.requiresTracking,
    active: true,
    metadata: {},
    created_at: now,
    updated_at: now,
  }));
}

function sortRates<T extends { code: string }>(rates: T[]) {
  return [...rates].sort((a, b) => {
    const aIndex = shippingCodeOrder.indexOf(a.code);
    const bIndex = shippingCodeOrder.indexOf(b.code);

    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });
}

export function shippingRateToMethod(rate: ShippingRate): ShippingMethod {
  return {
    code: rate.code,
    name: rate.name,
    description: rate.description ?? "",
    price: rate.amount_cents / 100,
    requiresTracking: rate.requires_tracking,
    freeOver: rate.free_over_cents === null ? undefined : rate.free_over_cents / 100,
  };
}

export async function getShippingRates(options: { includeInactive?: boolean } = {}) {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from("shipping_rates").select("*");

  if (!options.includeInactive) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;

  if (error?.code === "42P01") {
    return fallbackRates().filter((rate) => options.includeInactive || rate.active);
  }

  if (error) throw new Error(error.message);

  const rates = (data ?? []) as ShippingRate[];

  return sortRates(rates.length ? rates : fallbackRates()).filter(
    (rate) => options.includeInactive || rate.active,
  );
}

export async function getActiveShippingMethods() {
  const rates = await getShippingRates();

  return rates.map(shippingRateToMethod);
}

export async function getAvailableAdminShippingMethods(items: CartItem[]) {
  const methods = await getActiveShippingMethods();

  return getAvailableShippingMethods(items, methods);
}

export async function updateShippingRates(rates: ShippingRateInput[]) {
  if (!rates.length) return;

  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { error } = await supabase.from("shipping_rates").upsert(
    rates.map((rate) => ({
      ...rate,
      updated_at: now,
    })),
    { onConflict: "code" },
  );

  if (error) throw new Error(error.message);
}
