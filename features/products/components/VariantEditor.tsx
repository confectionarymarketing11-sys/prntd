"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InventoryPolicy, ProductFormVariant } from "@/features/products/types/product";

function newVariant(): ProductFormVariant {
  return {
    title: "Default Title",
    sku: "",
    price_cents: 0,
    inventory_quantity: 0,
    inventory_policy: "deny",
    option1_name: "",
    option1_value: "",
    option2_name: "",
    option2_value: "",
    active: true,
  };
}

function centsToInput(value: number) {
  return (Number(value ?? 0) / 100).toFixed(2);
}

function inputToCents(value: string) {
  return Math.round(Number(value || 0) * 100);
}

export default function VariantEditor({ variants: initialVariants }: { variants: ProductFormVariant[] }) {
  const [variants, setVariants] = useState<ProductFormVariant[]>(initialVariants.length ? initialVariants : [newVariant()]);
  const serialized = useMemo(() => JSON.stringify(variants), [variants]);

  function updateVariant(index: number, patch: Partial<ProductFormVariant>) {
    setVariants((current) => current.map((variant, variantIndex) => (variantIndex === index ? { ...variant, ...patch } : variant)));
  }

  function removeVariant(index: number) {
    setVariants((current) => {
      const next = current.filter((_, variantIndex) => variantIndex !== index);
      return next.length ? next : [newVariant()];
    });
  }

  return (
    <div className="grid gap-4">
      <input type="hidden" name="variants" value={serialized} />
      <div className="grid gap-3">
        {variants.map((variant, index) => (
          <div key={`${variant.id ?? "new"}-${index}`} className="grid gap-3 rounded-xl border border-slate-200 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-black">Variant {index + 1}</p>
                <p className="text-xs text-slate-500">SKU, price, options, and inventory.</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={variant.active}
                    onChange={(event) => updateVariant(index, { active: event.target.checked })}
                    className="h-4 w-4"
                  />
                  Active
                </label>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(index)}>
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="grid gap-1 text-sm font-semibold">
                Title
                <Input value={variant.title} onChange={(event) => updateVariant(index, { title: event.target.value })} placeholder="Small / Black" />
              </label>
              <label className="grid gap-1 text-sm font-semibold">
                SKU
                <Input value={variant.sku ?? ""} onChange={(event) => updateVariant(index, { sku: event.target.value })} placeholder="PRNTD-TEE-BLK-S" />
              </label>
              <label className="grid gap-1 text-sm font-semibold">
                Price
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={centsToInput(variant.price_cents)}
                  onChange={(event) => updateVariant(index, { price_cents: inputToCents(event.target.value) })}
                />
              </label>
              <label className="grid gap-1 text-sm font-semibold">
                Inventory
                <Input
                  type="number"
                  value={variant.inventory_quantity}
                  onChange={(event) => updateVariant(index, { inventory_quantity: Number(event.target.value || 0) })}
                />
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <label className="grid gap-1 text-sm font-semibold">
                Option 1 name
                <Input value={variant.option1_name ?? ""} onChange={(event) => updateVariant(index, { option1_name: event.target.value })} placeholder="Size" />
              </label>
              <label className="grid gap-1 text-sm font-semibold">
                Option 1 value
                <Input value={variant.option1_value ?? ""} onChange={(event) => updateVariant(index, { option1_value: event.target.value })} placeholder="Large" />
              </label>
              <label className="grid gap-1 text-sm font-semibold">
                Option 2 name
                <Input value={variant.option2_name ?? ""} onChange={(event) => updateVariant(index, { option2_name: event.target.value })} placeholder="Color" />
              </label>
              <label className="grid gap-1 text-sm font-semibold">
                Option 2 value
                <Input value={variant.option2_value ?? ""} onChange={(event) => updateVariant(index, { option2_value: event.target.value })} placeholder="Black" />
              </label>
              <label className="grid gap-1 text-sm font-semibold">
                Inventory policy
                <select
                  value={variant.inventory_policy}
                  onChange={(event) => updateVariant(index, { inventory_policy: event.target.value as InventoryPolicy })}
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                >
                  <option value="deny">Stop selling at 0</option>
                  <option value="continue">Continue selling</option>
                </select>
              </label>
            </div>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" onClick={() => setVariants((current) => [...current, newVariant()])}>
        <Plus className="h-4 w-4" />
        Add Variant
      </Button>
    </div>
  );
}
