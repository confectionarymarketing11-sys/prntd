import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import InventoryBadge from "@/features/products/components/InventoryBadge";
import { ProductStatusBadge, ProductVisibilityBadge } from "@/features/products/components/ProductStatusBadge";
import { formatProductCents, getProductInventory } from "@/features/products/data/products";
import type { PaginatedProducts } from "@/features/products/types/product";

export default function ProductTable({ data }: { data: PaginatedProducts }) {
  if (!data.products.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100">
            <Package className="h-6 w-6 text-slate-500" />
          </div>
          <p className="mt-4 font-semibold">No products match this view.</p>
          <p className="mt-1 text-sm text-slate-500">Create a product or adjust your filters to see more catalog items.</p>
          <Button asChild className="mt-5">
            <Link href="/admin/products/new">Create Product</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Inventory</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.products.map((product) => {
              const featuredImage = product.featured_image_url || product.images.find((image) => image.is_featured)?.url || product.images[0]?.url;
              const inventory = getProductInventory(product);

              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex min-w-[260px] items-center gap-3">
                      <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        {featuredImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={featuredImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <Link href={`/admin/products/${product.id}`} className="font-black text-slate-950 no-underline hover:underline">
                          {product.title}
                        </Link>
                        <p className="mt-1 text-xs text-slate-500">/{product.slug}</p>
                        <p className="mt-1 text-xs text-slate-500">{product.variants.length} variant(s)</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <ProductStatusBadge status={product.status} />
                      <ProductVisibilityBadge visibility={product.visibility} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <InventoryBadge quantity={inventory} />
                  </TableCell>
                  <TableCell className="font-black">{formatProductCents(product.price_cents, product.currency)}</TableCell>
                  <TableCell className="text-sm text-slate-500">{new Date(product.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/products/${product.id}`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
