import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomerTable from "@/features/customers/components/CustomerTable";
import CustomersFilterBar from "@/features/customers/components/CustomersFilterBar";
import CustomersPagination from "@/features/customers/components/CustomersPagination";
import { formatCustomerCents, getCustomerMetrics, getCustomers } from "@/features/customers/data/customers";
import type { CustomersQuery } from "@/features/customers/types/customer";

export const dynamic = "force-dynamic";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query: CustomersQuery = {
    search: params.search,
    status: params.status ?? "all",
    plan: params.plan ?? "all",
    sort: (params.sort as CustomersQuery["sort"]) ?? "newest",
    page: Number(params.page ?? 1),
  };
  const [customers, metrics] = await Promise.all([getCustomers(query), getCustomerMetrics()]);

  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">Customer desk</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Customers</h1>
        <p className="mt-2 text-sm text-slate-500">Profiles, spend, orders, designs, notes, and account health.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-500">Customers</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{metrics.total}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-500">Active</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{metrics.active}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-500">Total Spend</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{formatCustomerCents(metrics.totalSpendCents)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-500">Orders</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{metrics.totalOrders}</p></CardContent></Card>
      </div>
      <CustomersFilterBar search={params.search} status={params.status} plan={params.plan} sort={params.sort} />
      <CustomerTable data={customers} />
      <CustomersPagination page={customers.page} pageCount={customers.pageCount} searchParams={params} />
    </div>
  );
}
