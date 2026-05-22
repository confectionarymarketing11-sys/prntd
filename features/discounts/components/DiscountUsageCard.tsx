import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatProductCents } from "@/features/products/data/products";

export default function DiscountUsageCard({
  usageCount,
  usageLimit,
  discountedCents,
}: {
  usageCount: number;
  usageLimit: number | null;
  discountedCents: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Redemptions</span>
          <strong>{usageCount}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Usage limit</span>
          <strong>{usageLimit ?? "No limit"}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Total discounted</span>
          <strong>{formatProductCents(discountedCents)}</strong>
        </div>
      </CardContent>
    </Card>
  );
}
