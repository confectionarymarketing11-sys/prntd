import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductTable from "@/features/products/components/ProductTable";
import ProductsFilterBar from "@/features/products/components/ProductsFilterBar";
import ProductsPagination from "@/features/products/components/ProductsPagination";
import { getProductMetrics, getProducts } from "@/features/products/data/products";
import type { ProductsQuery, ProductStatus, ProductVisibility } from "@/features/products/types/product";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const query: ProductsQuery = {
    search: params.search,
    status: (params.status as ProductStatus | "all") ?? "all",
    visibility: (params.visibility as ProductVisibility | "all") ?? "all",
    sort: (params.sort as ProductsQuery["sort"]) ?? "newest",
    page: Number(params.page ?? 1),
  };

  const [products, metrics] = await Promise.all([getProducts(query), getProductMetrics()]);

  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">Catalog desk</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Products</h1>
          <p className="mt-2 text-sm text-slate-500">Create, publish, price, inventory, and manage product catalog entries.</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            Create Product
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black">{metrics.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black">{metrics.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black">{metrics.draft}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">Low Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black">{metrics.lowInventory}</p>
          </CardContent>
        </Card>
      </div>

      <ProductsFilterBar search={params.search} status={params.status} visibility={params.visibility} sort={params.sort} />
      <ProductTable data={products} />
      <ProductsPagination page={products.page} pageCount={products.pageCount} searchParams={params} />
    </div>
  );
}
