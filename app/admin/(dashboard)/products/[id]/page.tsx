import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductForm from "@/features/products/components/ProductForm";
import ProductQuickActions from "@/features/products/components/ProductQuickActions";
import { ProductStatusBadge, ProductVisibilityBadge } from "@/features/products/components/ProductStatusBadge";
import { updateProductAction } from "@/features/products/actions/products";
import { getProductById } from "@/features/products/data/products";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);

  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3">
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
              Back to products
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{product.title}</h1>
            <ProductStatusBadge status={product.status} />
            <ProductVisibilityBadge visibility={product.visibility} />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Last updated {new Date(product.updated_at).toLocaleString()} · /{product.slug}
          </p>
        </div>
        <ProductQuickActions productId={product.id} status={product.status} />
      </div>

      <ProductForm product={product} action={updateProductAction} submitLabel="Save Product" />
    </div>
  );
}
