import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ProductImageUploader from "@/features/products/components/ProductImageUploader";
import VariantEditor from "@/features/products/components/VariantEditor";
import { productToFormDefaults } from "@/features/products/data/products";
import type { ProductListItem } from "@/features/products/types/product";

type ProductFormProps = {
  product?: ProductListItem;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

export default function ProductForm({ product, action, submitLabel }: ProductFormProps) {
  const defaults = productToFormDefaults(product);

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      {product && <input type="hidden" name="productId" value={product.id} />}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Core merchandising content used by product pages and checkout.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              Title
              <Input name="title" defaultValue={defaults.title} placeholder="Classic Tee" required />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Description
              <Textarea name="description" defaultValue={defaults.description} placeholder="Describe the product, materials, production notes, and ordering expectations." rows={7} />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Product type
                <Input name="product_type" defaultValue={defaults.productType} placeholder="Apparel" />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Vendor
                <Input name="vendor" defaultValue={defaults.vendor} placeholder="PRNTD" />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-semibold">
              Tags
              <Input name="tags" defaultValue={defaults.tags} placeholder="shirt, custom, cotton" />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>Manage featured and gallery images. File upload storage can attach here later without changing the form contract.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductImageUploader images={defaults.images} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Variants</CardTitle>
            <CardDescription>Variants control sellable combinations, SKU, price, and inventory.</CardDescription>
          </CardHeader>
          <CardContent>
            <VariantEditor variants={defaults.variants} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search Engine Listing</CardTitle>
            <CardDescription>SEO-ready fields for future storefront indexing and product previews.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              Page title
              <Input name="seo_title" defaultValue={defaults.seoTitle} placeholder="Custom Classic Tee | PRNTD" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Meta description
              <Textarea name="seo_description" defaultValue={defaults.seoDescription} rows={4} placeholder="Short description for search engines and social cards." />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              URL handle
              <Input name="slug" defaultValue={defaults.slug} placeholder="classic-tee" />
            </label>
          </CardContent>
        </Card>
      </div>

      <aside className="grid h-fit gap-6 xl:sticky xl:top-6">
        <Card>
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
            <CardDescription>Shopify-style visibility and lifecycle controls.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              Status
              <select name="status" defaultValue={defaults.status} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Visibility
              <select name="visibility" defaultValue={defaults.visibility} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
                <option value="online">Online</option>
                <option value="hidden">Hidden</option>
              </select>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Prices are stored in cents server-side.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              Base price
              <Input name="price" type="number" min="0" step="0.01" defaultValue={defaults.price} required />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Compare-at price
              <Input name="compare_at_price" type="number" min="0" step="0.01" defaultValue={defaults.compareAtPrice} />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Currency
              <Input name="currency" defaultValue={defaults.currency} maxLength={3} />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Featured image URL
              <Input name="featured_image_url" defaultValue={defaults.featuredImageUrl} placeholder="Optional override" />
            </label>
          </CardContent>
        </Card>

        {product?.variants?.length ? (
          <Card>
            <CardHeader>
              <CardTitle>Current Variants</CardTitle>
              <CardDescription>Saved variants currently attached to this product.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {product.variants.map((variant) => (
                <div key={variant.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{variant.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{variant.sku || "No SKU"}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[11px] font-black ${variant.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                      {variant.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <span>Price: ${(variant.price_cents / 100).toFixed(2)} CAD</span>
                    <span>Inventory: {variant.inventory_quantity}</span>
                    {variant.option1_name && <span>{variant.option1_name}: {variant.option1_value}</span>}
                    {variant.option2_name && <span>{variant.option2_name}: {variant.option2_value}</span>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardContent className="grid gap-3 p-4">
            <Button type="submit" className="w-full">
              <Save className="h-4 w-4" />
              {submitLabel}
            </Button>
            <p className="text-xs leading-5 text-slate-500">The form is autosave-ready: product state is isolated by section and can be wired to debounced server actions later.</p>
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}
