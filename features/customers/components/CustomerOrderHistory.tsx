import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/features/admin/components/status-badge";
import { formatCents } from "@/features/admin/data/orders";
import type { FulfillmentOrder } from "@/features/admin/types/database";

export default function CustomerOrderHistory({ orders }: { orders: FulfillmentOrder[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Order History</CardTitle></CardHeader>
      <CardContent className="grid gap-3">
        {orders.length ? orders.map((order) => (
          <Link key={order.id} href={`/admin/orders/${order.id}`} className="grid gap-2 rounded-xl border border-slate-200 p-3 text-slate-950 no-underline hover:bg-slate-50 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="font-black">{order.order_number}</p>
              <p className="text-sm text-slate-500">{new Date(order.created_at).toLocaleString()}</p>
              <div className="mt-2 flex flex-wrap gap-2"><StatusBadge status={order.production_status} /><StatusBadge status={order.payment_status} /></div>
            </div>
            <p className="font-black">{formatCents(order.total_cents, order.currency)}</p>
          </Link>
        )) : <p className="text-sm text-slate-500">No orders yet.</p>}
      </CardContent>
    </Card>
  );
}
