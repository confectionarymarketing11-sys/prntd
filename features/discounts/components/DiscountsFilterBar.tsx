import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { discountStatuses, discountTypes } from "@/features/discounts/types/discount";

export default function DiscountsFilterBar({ search, status, type, sort }: { search?: string; status?: string; type?: string; sort?: string }) {
  return (
    <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_160px_170px_170px_auto]">
      <label className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input name="search" defaultValue={search ?? ""} placeholder="Search discount or code" className="pl-9" />
      </label>
      <select name="status" defaultValue={status ?? "all"} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
        <option value="all">All statuses</option>
        {discountStatuses.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
      <select name="type" defaultValue={type ?? "all"} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
        <option value="all">All types</option>
        {discountTypes.map((item) => (
          <option key={item} value={item}>{item.replace("_", " ")}</option>
        ))}
      </select>
      <select name="sort" defaultValue={sort ?? "newest"} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="usage_desc">Most used</option>
        <option value="title_asc">Title A-Z</option>
      </select>
      <Button type="submit">Apply</Button>
    </form>
  );
}
