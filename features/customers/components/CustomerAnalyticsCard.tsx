import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCustomerCents } from "@/features/customers/data/customers";
import type { CustomerDetail } from "@/features/customers/types/customer";

export default function CustomerAnalyticsCard({ customer }: { customer: CustomerDetail }) {
  const averageOrderCents = customer.order_count ? Math.round(customer.total_spend_cents / customer.order_count) : 0;

  return (
    <Card>
      <CardHeader><CardTitle>Customer Analytics</CardTitle></CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Total spend</p><p className="mt-1 text-2xl font-black">{formatCustomerCents(customer.total_spend_cents)}</p></div>
        <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Orders</p><p className="mt-1 text-2xl font-black">{customer.order_count}</p></div>
        <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">AOV</p><p className="mt-1 text-2xl font-black">{formatCustomerCents(averageOrderCents)}</p></div>
      </CardContent>
    </Card>
  );
}
