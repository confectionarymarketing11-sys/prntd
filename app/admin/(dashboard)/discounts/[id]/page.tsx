import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DiscountForm from "@/features/discounts/components/DiscountForm";
import DiscountStatusBadge from "@/features/discounts/components/DiscountStatusBadge";
import DiscountUsageCard from "@/features/discounts/components/DiscountUsageCard";
import { updateDiscountAction } from "@/features/discounts/actions/discounts";
import { getDiscountById, getDiscountRedemptions } from "@/features/discounts/data/discounts";

export const dynamic = "force-dynamic";

export default async function EditDiscountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [discount, redemptions] = await Promise.all([getDiscountById(id), getDiscountRedemptions(id)]);
  const discountedCents = redemptions.reduce(
    (sum, redemption) => sum + Number(redemption.discount_amount_cents ?? 0) + Number(redemption.shipping_discount_cents ?? 0),
    0
  );

  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3">
            <Link href="/admin/discounts"><ArrowLeft className="h-4 w-4" />Back to discounts</Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{discount.title}</h1>
            <DiscountStatusBadge status={discount.status} />
          </div>
          <p className="mt-2 text-sm text-slate-500">{discount.automatic ? "Automatic discount" : discount.code}</p>
        </div>
        <DiscountUsageCard usageCount={discount.usage_count} usageLimit={discount.usage_limit} discountedCents={discountedCents} />
      </div>

      <DiscountForm discount={discount} action={updateDiscountAction} submitLabel="Save Discount" />

      <Card>
        <CardHeader><CardTitle>Recent Redemptions</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm">
          {redemptions.length ? redemptions.map((redemption) => (
            <div key={redemption.id} className="flex flex-col gap-1 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold">{redemption.customer_email ?? "Unknown customer"}</p>
                <p className="text-slate-500">{new Date(redemption.created_at).toLocaleString()}</p>
              </div>
              <p className="font-black">{redemption.code ?? "Automatic"}</p>
            </div>
          )) : <p className="text-slate-500">No redemptions yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
