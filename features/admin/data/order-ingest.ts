import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/admin";
import type { Order } from "@/data/shop";

function toCents(value: number) {
  return Math.round(value * 100);
}

export async function persistStorefrontOrder(order: Order) {
  if (!hasSupabaseAdminConfig()) return;

  const supabase = createSupabaseAdminClient();
  const email = order.customer.email.trim().toLowerCase();

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .upsert(
      {
        email,
        name: order.customer.name || null,
        phone: order.customer.phone || null,
        company: order.customer.company || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    )
    .select("id")
    .single<{ id: string }>();

  if (customerError) throw new Error(customerError.message);

  const shippingAddress = {
    address: order.customer.address,
    city: order.customer.city,
    region: order.customer.region,
    postal: order.customer.postal,
  };

  const { data: dbOrder, error: orderError } = await supabase
    .from("orders")
    .upsert(
      {
        order_number: order.id,
        customer_id: customer.id,
        customer_email: email,
        customer_name: order.customer.name || null,
        customer_phone: order.customer.phone || null,
        shipping_address: shippingAddress,
        production_status: "pending",
        payment_status: order.paymentMode === "manual" ? "unpaid" : "authorized",
        subtotal_cents: toCents(order.subtotal),
        shipping_cents: toCents(order.shipping),
        tax_cents: toCents(order.tax),
        total_cents: toCents(order.total),
        currency: "CAD",
        notes: order.customer.notes || null,
        source: "storefront",
        external_order_id: order.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "order_number" }
    )
    .select("id")
    .single<{ id: string }>();

  if (orderError) throw new Error(orderError.message);

  await supabase.from("order_items").delete().eq("order_id", dbOrder.id);

  const items = order.items.map((item) => ({
    order_id: dbOrder.id,
    product_id: item.productId,
    product_name: item.productName,
    quantity: item.quantity,
    unit_price_cents: toCents(item.unitPrice),
    line_total_cents: toCents(item.lineTotal),
    customization: {
      size: item.size,
      color: item.color,
      frontLayers: item.frontLayers,
      backLayers: item.backLayers,
    },
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(items);
  if (itemsError) throw new Error(itemsError.message);

  await supabase.from("production_status").insert({
    order_id: dbOrder.id,
    status: "pending",
    note: "Order created from storefront checkout.",
  });
}
