import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ShipmentStatus } from "@/features/admin/types/database";

export type ShipmentPayload = {
  orderId: string;
  provider?: "shippo" | "shipstation" | "easypost" | "canada_post" | "manual";
  carrier?: string;
  serviceLevel?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  labelUrl?: string;
  status?: ShipmentStatus;
};

export async function upsertShipment(payload: ShipmentPayload) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("shipments").upsert(
    {
      order_id: payload.orderId,
      provider: payload.provider ?? "manual",
      carrier: payload.carrier || null,
      service_level: payload.serviceLevel || null,
      tracking_number: payload.trackingNumber || null,
      tracking_url: payload.trackingUrl || null,
      label_url: payload.labelUrl || null,
      status: payload.status ?? "label_created",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "order_id" }
  );

  if (error) {
    throw new Error(error.message);
  }
}
