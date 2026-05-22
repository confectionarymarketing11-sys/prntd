import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { paymentStatuses, productionStatuses } from "@/features/admin/types/database";

const productionLabels = {
  pending: "Pending",
  approved: "Approved",
  printing: "Printing",
  cutting: "Cutting",
  packing: "Packing",
  shipped: "Shipped",
  completed: "Completed",
};

const paymentLabels = {
  unpaid: "Unpaid",
  authorized: "Authorized",
  paid: "Paid",
  refunded: "Refunded",
  failed: "Failed",
};

export default function OrdersFilterBar({
  search,
  status,
  payment,
  sort,
}: {
  search?: string;
  status?: string;
  payment?: string;
  sort?: string;
}) {
  return (
    <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_180px_180px_180px_auto]">
      <label className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input name="search" defaultValue={search ?? ""} placeholder="Search order, customer, email" className="pl-9" />
      </label>
      <select name="status" defaultValue={status ?? "all"} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
        <option value="all">All statuses</option>
        {productionStatuses.map((item) => (
          <option key={item} value={item}>
            {productionLabels[item]}
          </option>
        ))}
      </select>
      <select name="payment" defaultValue={payment ?? "all"} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
        <option value="all">All payments</option>
        {paymentStatuses.map((item) => (
          <option key={item} value={item}>
            {paymentLabels[item]}
          </option>
        ))}
      </select>
      <select name="sort" defaultValue={sort ?? "newest"} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="total_desc">Highest total</option>
        <option value="total_asc">Lowest total</option>
      </select>
      <Button type="submit">Apply</Button>
    </form>
  );
}
