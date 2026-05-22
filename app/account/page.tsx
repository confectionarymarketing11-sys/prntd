import Link from "next/link";
import { fetchCustomerDesigns, fetchCustomerOrders, formatAccountMoney } from "@/lib/account/customer-data";
import { requireCustomerUser } from "@/lib/auth/customer";

function formatDate(value?: string) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function AccountPage() {
  const user = await requireCustomerUser();
  const email = user.email ?? "";
  const [orders, designs] = await Promise.all([fetchCustomerOrders(email), fetchCustomerDesigns(email)]);
  const paidTotal = orders.reduce((sum, order) => sum + Number(order.total_cents ?? 0), 0);

  return (
    <div className="grid gap-6">
      <header className="rounded-[30px] bg-[#111827] p-6 text-white shadow-[0_18px_50px_rgba(17,24,39,0.18)] sm:p-8">
        <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-white/70">
          Customer Account
        </p>
        <h1 className="text-[clamp(34px,4.2vw,62px)] font-black leading-none tracking-normal">
          Welcome back{email ? `, ${email.split("@")[0]}` : ""}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
          Your PRNTD home for order history, saved designs, and account settings.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Orders", String(orders.length), "Print jobs connected to this account"],
          ["Saved Designs", String(designs.length), "AI and uploaded assets found for this email"],
          ["Total Spend", formatAccountMoney(paidTotal, orders[0]?.currency ?? "CAD"), "From fulfilled checkout records"],
        ].map(([label, value, detail]) => (
          <article key={label} className="rounded-[24px] border border-white/70 bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.045)]">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">{label}</h2>
            <p className="mt-3 text-[32px] font-black leading-none">{value}</p>
            <p className="mt-3 text-sm leading-6 text-[#6b7280]">{detail}</p>
          </article>
        ))}
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_10px_28px_rgba(0,0,0,0.045)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black">Recent Orders</h2>
            <Link href="/account/orders" className="text-sm font-extrabold text-[#4f46e5]">
              View all
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {orders.slice(0, 4).map((order) => (
              <div key={order.id} className="rounded-[20px] bg-[#f5f7fb] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-black">{order.order_number}</p>
                  <p className="text-sm font-extrabold text-[#4338ca]">{order.production_status}</p>
                </div>
                <p className="mt-2 text-sm text-[#6b7280]">
                  {formatDate(order.created_at)} • {formatAccountMoney(order.total_cents, order.currency)}
                </p>
              </div>
            ))}
            {!orders.length && <p className="text-sm leading-6 text-[#6b7280]">No orders are linked to this account yet.</p>}
          </div>
        </article>

        <article className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_10px_28px_rgba(0,0,0,0.045)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black">Recent Designs</h2>
            <Link href="/account/designs" className="text-sm font-extrabold text-[#4f46e5]">
              View all
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {designs.slice(0, 4).map((design) => (
              <div key={design.path} className="rounded-[20px] bg-[#f5f7fb] p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={design.url} alt={design.prompt || "Saved design"} className="aspect-square w-full rounded-[16px] object-contain" />
              </div>
            ))}
            {!designs.length && <p className="col-span-full text-sm leading-6 text-[#6b7280]">No saved designs are linked to this account yet.</p>}
          </div>
        </article>
      </section>
    </div>
  );
}
