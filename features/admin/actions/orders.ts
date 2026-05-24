"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/admin/data/auth";
import { updateOrderStatus, updatePaymentStatus } from "@/features/admin/data/orders";
import { upsertShipment } from "@/features/admin/data/shipments";
import { shippingConfirmationTemplate, sendTransactionalEmail } from "@/lib/email";
import { getStripe } from "@/lib/stripe";
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

export async function refundOrderAction(formData: FormData) {
  const admin = await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) throw new Error("Missing order id.");

  const supabase = createSupabaseAdminClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, checkout_session_id, external_order_id, source, payment_status")
    .eq("id", orderId)
    .maybeSingle<{
      id: string;
      checkout_session_id: string | null;
      external_order_id: string | null;
      source: string | null;
      payment_status: string | null;
    }>();

  if (error || !order) throw error ?? new Error("Order not found.");

  const isTestOrder = (order.external_order_id ?? "").startsWith("test_") || (order.checkout_session_id ?? "").startsWith("test_");

  if (!isTestOrder) {
    const sessionId = order.checkout_session_id || order.external_order_id;
    if (!sessionId) throw new Error("This order does not have a Stripe checkout session.");

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

    if (!paymentIntent) throw new Error("Stripe payment intent was not found.");

    await stripe.refunds.create(
      {
        payment_intent: paymentIntent,
        reason: "requested_by_customer",
        metadata: {
          order_id: orderId,
          changed_by: admin.email,
        },
      },
      {
        idempotencyKey: `refund:${orderId}`,
      }
    );
  }

  await supabase.from("orders").update({ payment_status: "refunded", updated_at: new Date().toISOString() }).eq("id", orderId);
  await supabase.from("production_status_history").insert({
    order_id: orderId,
    status: "completed",
    notes: isTestOrder ? "Test mode order marked refunded." : "Stripe refund created from admin.",
    changed_by: admin.email,
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
}
