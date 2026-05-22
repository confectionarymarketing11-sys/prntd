import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrdersFilterBar from "@/features/admin/components/orders-filter-bar";
import OrdersTable from "@/features/admin/components/orders-table";
import Pagination from "@/features/admin/components/pagination";
import { formatCents, getOrderMetrics, getOrders } from "@/features/admin/data/orders";
import type { OrdersQuery, PaymentStatus, ProductionStatus } from "@/features/admin/types/database";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const query: OrdersQuery = {
    search: params.search,
    status: (params.status as ProductionStatus | "all") ?? "all",
    payment: (params.payment as PaymentStatus | "all") ?? "all",
    sort: (params.sort as OrdersQuery["sort"]) ?? "newest",
    page: Number(params.page ?? 1),
  };

  const [orders, metrics] = await Promise.all([getOrders(query), getOrderMetrics()]);

  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">Production desk</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Orders</h1>
          <p className="mt-2 text-sm text-slate-500">Search, triage, produce, ship, and close fulfillment work.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">Open Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black">{metrics.openCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">Shipped / Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black">{metrics.shippedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">Paid Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black">{formatCents(metrics.paidRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      <OrdersFilterBar search={params.search} status={params.status} payment={params.payment} sort={params.sort} />
      <OrdersTable data={orders} />
      <Pagination page={orders.page} pageCount={orders.pageCount} searchParams={params} />
    </div>
  );
}
