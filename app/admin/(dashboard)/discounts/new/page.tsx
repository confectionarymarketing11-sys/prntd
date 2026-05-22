import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import DiscountForm from "@/features/discounts/components/DiscountForm";
import { createDiscountAction } from "@/features/discounts/actions/discounts";

export const dynamic = "force-dynamic";

export default function NewDiscountPage() {
  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3">
          <Link href="/admin/discounts"><ArrowLeft className="h-4 w-4" />Back to discounts</Link>
        </Button>
        <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">New promotion</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Create Discount</h1>
      </div>
      <DiscountForm action={createDiscountAction} submitLabel="Create Discount" />
    </div>
  );
}
