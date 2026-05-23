"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/admin/data/auth";
import { updateOrderStatus, updatePaymentStatus } from "@/features/admin/data/orders";
import { upsertShipment } from "@/features/admin/data/shipments";
import { shippingConfirmationTemplate, sendTransactionalEmail } from "@/lib/email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PaymentStatus, ProductionStatus, ShipmentStatus } from "@/features/admin/types/database";

export async function updateOrderStatusAction(orderId: string, status: ProductionStatus, note?: string) {
  const admin = await requireAdmin();

  await updateOrderStatus(orderId, status, admin.email, note);
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
    trackingNumber: String(formData.get("trackingNumber") ?? ""),
    trackingUrl: String(formData.get("trackingUrl") ?? ""),
    labelUrl: String(formData.get("labelUrl") ?? ""),
    status: String(formData.get("status") ?? "label_created") as ShipmentStatus,
  });

  const status = String(formData.get("status") ?? "label_created") as ShipmentStatus;
  const trackingNumber = String(formData.get("trackingNumber") ?? "");
  const trackingUrl = String(formData.get("trackingUrl") ?? "");

  if (status === "in_transit" || status === "delivered") {
    const supabase = createSupabaseAdminClient();
    const { data: order } = await supabase
      .from("orders")
      .select("order_number, customer_email, customer_name")
      .eq("id", orderId)
      .maybeSingle<{ order_number: string; customer_email: string; customer_name: string | null }>();

    if (order?.customer_email) {
      const email = shippingConfirmationTemplate({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        trackingNumber,
        trackingUrl,
      });

      await sendTransactionalEmail({
        eventKey: `shipping-confirmation:${orderId}:${trackingNumber || status}`,
        emailType: "shipping_confirmation",
        to: order.customer_email,
        subject: email.subject,
        html: email.html,
        text: email.text,
        metadata: {
          order_id: orderId,
          shipment_status: status,
        },
      });
    }
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
}
