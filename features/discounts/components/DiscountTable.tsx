import Link from "next/link";
import { BadgePercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DiscountStatusBadge from "@/features/discounts/components/DiscountStatusBadge";
import { formatDiscountValue } from "@/features/discounts/data/discounts";
import type { PaginatedDiscounts } from "@/features/discounts/types/discount";

export default function DiscountTable({ data }: { data: PaginatedDiscounts }) {
  if (!data.discounts.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100">
            <BadgePercent className="h-6 w-6 text-slate-500" />
          </div>
          <p className="mt-4 font-semibold">No discounts match this view.</p>
          <p className="mt-1 text-sm text-slate-500">Create a code, automatic discount, or free shipping offer.</p>
          <Button asChild className="mt-5">
            <Link href="/admin/discounts/new">Create Discount</Link>
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
              <TableHead>Discount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.discounts.map((discount) => (
              <TableRow key={discount.id}>
                <TableCell>
                  <Link href={`/admin/discounts/${discount.id}`} className="font-black text-slate-950 no-underline hover:underline">
                    {discount.title}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">{discount.automatic ? "Automatic discount" : discount.code}</p>
                </TableCell>
                <TableCell><DiscountStatusBadge status={discount.status} /></TableCell>
                <TableCell className="capitalize">{formatDiscountValue(discount)}</TableCell>
                <TableCell>{discount.usage_count}{discount.usage_limit ? ` / ${discount.usage_limit}` : ""}</TableCell>
                <TableCell className="text-sm text-slate-500">
                  {discount.starts_at ? new Date(discount.starts_at).toLocaleDateString() : "Now"} - {discount.ends_at ? new Date(discount.ends_at).toLocaleDateString() : "No end"}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/discounts/${discount.id}`}>Edit</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
