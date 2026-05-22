"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/admin/data/auth";
import { updateOrderStatus, updatePaymentStatus } from "@/features/admin/data/orders";
import { upsertShipment } from "@/features/admin/data/shipments";
import type { PaymentStatus, ProductionStatus, ShipmentStatus } from "@/features/admin/types/database";

export async function updateOrderStatusAction(orderId: string, status: ProductionStatus, note?: string) {
  const admin = await requireAdmin();

  await updateOrderStatus(orderId, status, admin.id, note);
  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updatePaymentStatusAction(orderId: string, status: PaymentStatus) {
  await requireAdmin();

  await updatePaymentStatus(orderId, status);
  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateShipmentAction(formData: FormData) {
  await requireAdmin();

  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) throw new Error("Missing order id.");

  await upsertShipment({
    orderId,
    provider: String(formData.get("provider") ?? "manual") as "shippo" | "shipstation" | "easypost" | "canada_post" | "manual",
    carrier: String(formData.get("carrier") ?? ""),
    serviceLevel: String(formData.get("serviceLevel") ?? ""),
    trackingNumber: String(formData.get("trackingNumber") ?? ""),
    trackingUrl: String(formData.get("trackingUrl") ?? ""),
    labelUrl: String(formData.get("labelUrl") ?? ""),
    status: String(formData.get("status") ?? "label_created") as ShipmentStatus,
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
}
