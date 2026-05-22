import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnalyticsCard from "@/features/analytics/components/AnalyticsCard";
import AnalyticsDateRange from "@/features/analytics/components/AnalyticsDateRange";
import MiniBarChart from "@/features/analytics/components/MiniBarChart";
import { getAnalytics } from "@/features/analytics/data/analytics";
import type { DateRangeKey } from "@/features/analytics/types/analytics";
import { formatProductCents } from "@/features/products/data/products";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const range = (params.range === "7d" || params.range === "90d" ? params.range : "30d") as DateRangeKey;
  const analytics = await getAnalytics(range);
  const statusRows = Object.entries(analytics.productionBreakdown).map(([label, value]) => ({ label, value }));

  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">Analytics</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Commerce Analytics</h1>
          <p className="mt-2 text-sm text-slate-500">Revenue, orders, production, fulfillment, products, and customers.</p>
        </div>
        <AnalyticsDateRange value={range} />
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <AnalyticsCard title="Revenue" value={formatProductCents(analytics.revenueCents)} />
        <AnalyticsCard title="Paid Orders" value={analytics.paidOrders} />
        <AnalyticsCard title="AOV" value={formatProductCents(analytics.averageOrderValueCents)} />
        <AnalyticsCard title="Open Fulfillment" value={analytics.openFulfillment} />
        <AnalyticsCard title="Shipped / Completed" value={analytics.shippedOrders} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <MiniBarChart title="Revenue Over Time" data={analytics.revenueSeries.map((point) => ({ label: point.label, revenueCents: point.revenueCents }))} valueKey="revenueCents" formatValue={formatProductCents} />
        <MiniBarChart title="Orders Over Time" data={analytics.revenueSeries.map((point) => ({ label: point.label, orders: point.orders }))} valueKey="orders" formatValue={(value) => String(value)} />
        <MiniBarChart title="Top Selling Products" data={analytics.topProducts.map((product) => ({ label: product.productName, revenueCents: product.revenueCents }))} valueKey="revenueCents" formatValue={formatProductCents} />
        <MiniBarChart title="Production Status Breakdown" data={statusRows} valueKey="value" formatValue={(value) => String(value)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top Customers</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {analytics.topCustomers.length ? analytics.topCustomers.map((customer) => (
              <div key={customer.customerId ?? customer.customerEmail} className="flex justify-between rounded-xl border border-slate-200 p-3 text-sm">
                <div><p className="font-black">{customer.customerName || customer.customerEmail}</p><p className="text-slate-500">{customer.orderCount} orders</p></div>
                <strong>{formatProductCents(customer.totalCents)}</strong>
              </div>
            )) : <p className="text-sm text-slate-500">No paid customers in this range.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {analytics.recentActivity.length ? analytics.recentActivity.map((activity) => (
              <div key={activity.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                <p className="font-black capitalize">{activity.label}</p>
                <p className="text-slate-500">{activity.detail}</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(activity.createdAt).toLocaleString()}</p>
              </div>
            )) : <p className="text-sm text-slate-500">No recent activity in this range.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
