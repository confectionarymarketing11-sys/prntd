import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DiscountTable from "@/features/discounts/components/DiscountTable";
import DiscountsFilterBar from "@/features/discounts/components/DiscountsFilterBar";
import DiscountsPagination from "@/features/discounts/components/DiscountsPagination";
import { getDiscountMetrics, getDiscounts } from "@/features/discounts/data/discounts";
import type { DiscountsQuery, DiscountStatus, DiscountType } from "@/features/discounts/types/discount";
import { formatProductCents } from "@/features/products/data/products";

export const dynamic = "force-dynamic";

export default async function DiscountsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query: DiscountsQuery = {
    search: params.search,
    status: (params.status as DiscountStatus | "all") ?? "all",
    type: (params.type as DiscountType | "all") ?? "all",
    sort: (params.sort as DiscountsQuery["sort"]) ?? "newest",
    page: Number(params.page ?? 1),
  };
  const [discounts, metrics] = await Promise.all([getDiscounts(query), getDiscountMetrics()]);

  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">Commerce desk</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Discounts</h1>
          <p className="mt-2 text-sm text-slate-500">Manage coupon codes, automatic offers, free shipping, and usage limits.</p>
        </div>
        <Button asChild><Link href="/admin/discounts/new"><Plus className="h-4 w-4" />Create Discount</Link></Button>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-500">Active</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{metrics.active}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-500">Automatic</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{metrics.automatic}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-500">Redemptions</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{metrics.redemptions}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-500">Discounted</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{formatProductCents(metrics.totalDiscountedCents)}</p></CardContent></Card>
      </div>
      <DiscountsFilterBar search={params.search} status={params.status} type={params.type} sort={params.sort} />
      <DiscountTable data={discounts} />
      <DiscountsPagination page={discounts.page} pageCount={discounts.pageCount} searchParams={params} />
    </div>
  );
}
