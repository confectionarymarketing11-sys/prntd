import { fetchCustomerOrders, formatAccountMoney } from "@/lib/account/customer-data";
import { requireCustomerUser } from "@/lib/auth/customer";

function formatDate(value?: string) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function AccountOrdersPage() {
  const user = await requireCustomerUser();
  const orders = await fetchCustomerOrders(user.email ?? "");

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-[clamp(34px,4.2vw,56px)] font-black leading-none tracking-normal">Orders</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#6b7280]">Track print jobs, payment state, fulfillment progress, and shipment details.</p>
      </header>

      <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_10px_28px_rgba(0,0,0,0.045)]">
        {orders.length ? (
          <div className="grid divide-y divide-[#eef2f7]">
            {orders.map((order) => (
              <article key={order.id} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_180px]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black">{order.order_number}</h2>
                    <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.08em] text-[#4338ca]">
                      {order.production_status}
                    </span>
                    <span className="rounded-full bg-[#f5f7fb] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.08em] text-[#6b7280]">
                      {order.payment_status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#6b7280]">{formatDate(order.created_at)}</p>
                  <div className="mt-4 grid gap-2">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="rounded-[18px] bg-[#f5f7fb] p-3 text-sm">
                        <p className="font-extrabold">{item.product_name}</p>
                        <p className="mt-1 text-[#6b7280]">
                          Qty {item.quantity} • {formatAccountMoney(item.line_total_cents, order.currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                  {order.shipments?.map((shipment) => (
                    <p key={shipment.id} className="mt-3 text-sm font-bold text-[#374151]">
                      Shipment: {shipment.shipment_status}
                      {shipment.tracking_number ? ` • ${shipment.tracking_number}` : ""}
                      {shipment.tracking_url ? (
                        <a href={shipment.tracking_url} className="ml-2 text-[#4f46e5]" target="_blank" rel="noreferrer">
                          Track
                        </a>
                      ) : null}
                    </p>
                  ))}
                </div>
                <div className="rounded-[22px] bg-[#111827] p-5 text-white">
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/55">Total</p>
                  <p className="mt-2 text-3xl font-black">{formatAccountMoney(order.total_cents, order.currency)}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="p-6 text-[#6b7280]">No orders are linked to this account yet.</p>
        )}
      </section>
    </div>
  );
}
