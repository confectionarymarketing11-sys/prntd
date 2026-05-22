import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductForm from "@/features/products/components/ProductForm";
import { createProductAction } from "@/features/products/actions/products";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3">
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
            Back to products
          </Link>
        </Button>
        <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">New catalog item</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Create Product</h1>
        <p className="mt-2 text-sm text-slate-500">Set up product details, pricing, media, variants, inventory, and visibility.</p>
      </div>

      <ProductForm action={createProductAction} submitLabel="Create Product" />
    </div>
  );
}
