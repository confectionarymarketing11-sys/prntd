import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnalyticsCard from "@/features/analytics/components/AnalyticsCard";
import AnalyticsDateRange from "@/features/analytics/components/AnalyticsDateRange";
import MiniBarChart from "@/features/analytics/components/MiniBarChart";
import MiniLineChart from "@/features/analytics/components/MiniLineChart";
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
        <AnalyticsCard title="Daily Visitors" value={analytics.dailyVisitors} note="Unique visitors today" />
        <AnalyticsCard title="Added To Cart" value={analytics.addedToCart} />
        <AnalyticsCard title="Reached Checkout" value={analytics.reachedCheckout} />
        <AnalyticsCard title="Checked Out" value={analytics.checkoutCompleted} />
        <AnalyticsCard title="Conversion Rate" value={`${analytics.conversionRate}%`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <MiniLineChart title="Revenue Over Time" data={analytics.revenueSeries.map((point) => ({ label: point.label, revenueCents: point.revenueCents }))} valueKey="revenueCents" formatValue={formatProductCents} />
        <MiniLineChart title="Orders Over Time" data={analytics.revenueSeries.map((point) => ({ label: point.label, orders: point.orders }))} valueKey="orders" formatValue={(value) => String(value)} />
        <MiniLineChart title="Visitors Over Time" data={analytics.revenueSeries.map((point) => ({ label: point.label, visitors: point.visitors ?? 0 }))} valueKey="visitors" formatValue={(value) => String(value)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader><CardTitle>Conversion Breakdown</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            {[
              { label: "Daily visitors", value: analytics.dailyVisitors },
              { label: "Added to cart", value: analytics.addedToCart },
              { label: "Reached checkout", value: analytics.reachedCheckout },
              { label: "Checked out", value: analytics.checkoutCompleted },
            ].map((item, index, rows) => {
              const max = Math.max(rows[0]?.value ?? 0, 1);
              return (
                <div key={item.label} className="grid gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-600">{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                  <div className="h-10 overflow-hidden rounded bg-slate-100">
                    <div
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${Math.max((item.value / max) * 100, index === 0 ? 100 : 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Live Customer View</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {analytics.liveVisitors.length ? analytics.liveVisitors.map((visitor) => (
              <div key={visitor.sessionId} className="rounded-xl border border-slate-200 p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black capitalize">{visitor.eventType.replace(/_/g, " ")}</p>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">Live</span>
                </div>
                <p className="mt-1 truncate text-slate-500">{visitor.pathname || "/"}</p>
                <p className="mt-1 truncate text-xs text-slate-400">{visitor.customerEmail || visitor.visitorId}</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(visitor.lastSeenAt).toLocaleTimeString()}</p>
              </div>
            )) : <p className="text-sm text-slate-500">No active storefront sessions in the last 5 minutes.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <AnalyticsCard title="Revenue" value={formatProductCents(analytics.revenueCents)} />
        <AnalyticsCard title="Paid Orders" value={analytics.paidOrders} />
        <AnalyticsCard title="AOV" value={formatProductCents(analytics.averageOrderValueCents)} />
        <AnalyticsCard title="Open Fulfillment" value={analytics.openFulfillment} />
        <AnalyticsCard title="Shipped / Completed" value={analytics.shippedOrders} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <MiniLineChart title="Checked Out Over Time" data={analytics.revenueSeries.map((point) => ({ label: point.label, checkoutCompleted: point.checkoutCompleted ?? 0 }))} valueKey="checkoutCompleted" formatValue={(value) => String(value)} />
        <MiniBarChart title="Top Selling Products" data={analytics.topProducts.map((product) => ({ label: product.productName, revenueCents: product.revenueCents }))} valueKey="revenueCents" formatValue={formatProductCents} />
        <MiniBarChart title="Production Status Breakdown" data={statusRows} valueKey="value" formatValue={(value) => String(value)} />
      </div>

    </div>
  );
}
