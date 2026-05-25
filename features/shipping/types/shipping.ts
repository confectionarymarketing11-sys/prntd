import type { ShippingMethodCode } from "@/data/shop";

export type ShippingMethodType = "lettermail" | "tracked" | "local_pickup";

export type ShippingRate = {
  id: string;
  profile_id: string | null;
  code: ShippingMethodCode;
  name: string;
  description: string | null;
  amount_cents: number;
  currency: string;
  method_type: ShippingMethodType;
  min_subtotal_cents: number;
  free_over_cents: number | null;
  requires_tracking: boolean;
  active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ShippingRateInput = {
  code: ShippingMethodCode;
  name: string;
  description: string | null;
  amount_cents: number;
  currency: string;
  method_type: ShippingMethodType;
  min_subtotal_cents: number;
  free_over_cents: number | null;
  requires_tracking: boolean;
  active: boolean;
};
