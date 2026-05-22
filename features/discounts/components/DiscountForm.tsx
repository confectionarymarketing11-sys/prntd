import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Discount } from "@/features/discounts/types/discount";

function dollars(cents: number) {
  return (cents / 100).toFixed(2);
}

function dateInput(value: string | null) {
  return value ? value.slice(0, 16) : "";
}

export default function DiscountForm({
  discount,
  action,
  submitLabel,
}: {
  discount?: Discount;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}) {
  const isPercentage = discount?.discount_type === "percentage";

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      {discount && <input type="hidden" name="discountId" value={discount.id} />}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Discount Details</CardTitle>
            <CardDescription>Discounts are calculated by PRNTD before Stripe receives final totals.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              Title
              <Input name="title" defaultValue={discount?.title ?? ""} placeholder="Summer launch discount" required />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Type
                <select name="discount_type" defaultValue={discount?.discount_type ?? "percentage"} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option value="percentage">Percentage</option>
                  <option value="fixed_amount">Fixed amount</option>
                  <option value="free_shipping">Free shipping</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Value
                <Input name="value" type="number" min="0" step="0.01" defaultValue={discount ? (isPercentage ? discount.value : dollars(discount.value)) : "10"} />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-semibold">
              Coupon code
              <Input name="code" defaultValue={discount?.code ?? ""} placeholder="SAVE10" />
            </label>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input name="automatic" type="checkbox" defaultChecked={discount?.automatic ?? false} />
                Automatic
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input name="once_per_customer" type="checkbox" defaultChecked={discount?.once_per_customer ?? false} />
                Once per customer
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input name="combinable" type="checkbox" defaultChecked={discount?.combinable ?? false} />
                Combinable
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eligibility</CardTitle>
            <CardDescription>Leave customer and product eligibility blank to apply broadly.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Minimum order
                <Input name="minimum_order" type="number" min="0" step="0.01" defaultValue={discount ? dollars(discount.minimum_order_cents) : "0"} />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Minimum quantity
                <Input name="minimum_quantity" type="number" min="0" defaultValue={discount?.minimum_quantity ?? 0} />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-semibold">
              Eligible customer IDs
              <Input name="eligible_customer_ids" defaultValue={discount?.eligible_customer_ids.join(", ") ?? ""} placeholder="Comma-separated UUIDs" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Eligible product IDs
              <Input name="eligible_product_ids" defaultValue={discount?.eligible_product_ids.join(", ") ?? ""} placeholder="classic-tee, business-cards" />
            </label>
          </CardContent>
        </Card>
      </div>

      <aside className="grid h-fit gap-6 xl:sticky xl:top-6">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              Status
              <select name="status" defaultValue={discount?.status ?? "inactive"} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Starts at
              <Input name="starts_at" type="datetime-local" defaultValue={dateInput(discount?.starts_at ?? null)} />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Ends at
              <Input name="ends_at" type="datetime-local" defaultValue={dateInput(discount?.ends_at ?? null)} />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Usage limit
              <Input name="usage_limit" type="number" min="1" defaultValue={discount?.usage_limit ?? ""} />
            </label>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Button type="submit" className="w-full">
              <Save className="h-4 w-4" />
              {submitLabel}
            </Button>
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}
