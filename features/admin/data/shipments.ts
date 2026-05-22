import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ShipmentStatus } from "@/features/admin/types/database";

export type ShipmentPayload = {
  orderId: string;
  provider?: "shippo" | "shipstation" | "easypost" | "canada_post" | "manual";
  trackingNumber?: string;
  trackingUrl?: string;
  labelUrl?: string;
  status?: ShipmentStatus;
};

export async function upsertShipment(payload: ShipmentPayload) {
  const supabase = createSupabaseAdminClient();
  const shipment = {
    order_id: payload.orderId,
    provider: payload.provider ?? "manual",
    tracking_number: payload.trackingNumber || null,
    tracking_url: payload.trackingUrl || null,
    label_url: payload.labelUrl || null,
    shipment_status: payload.status ?? "label_created",
  };

  const { data: existing, error: lookupError } = await supabase
    .from("shipments")
    .select("id")
    .eq("order_id", payload.orderId)
    .maybeSingle<{ id: string }>();

  if (lookupError) {
    throw new Error(lookupError.message);
  }

  const { error } = existing
    ? await supabase.from("shipments").update(shipment).eq("id", existing.id)
    : await supabase.from("shipments").insert(shipment);

  if (error) {
    throw new Error(error.message);
  }
}
