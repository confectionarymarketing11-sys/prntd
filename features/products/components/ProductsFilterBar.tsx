import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { productStatuses, productVisibilities } from "@/features/products/types/product";

const statusLabels = {
  draft: "Draft",
  active: "Active",
  archived: "Archived",
};

const visibilityLabels = {
  online: "Online",
  hidden: "Hidden",
};

export default function ProductsFilterBar({
  search,
  status,
  visibility,
  sort,
}: {
  search?: string;
  status?: string;
  visibility?: string;
  sort?: string;
}) {
  return (
    <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_160px_160px_190px_auto]">
      <label className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input name="search" defaultValue={search ?? ""} placeholder="Search title, slug, type, vendor" className="pl-9" />
      </label>
      <select name="status" defaultValue={status ?? "all"} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
        <option value="all">All statuses</option>
        {productStatuses.map((item) => (
          <option key={item} value={item}>
            {statusLabels[item]}
          </option>
        ))}
      </select>
      <select name="visibility" defaultValue={visibility ?? "all"} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
        <option value="all">All visibility</option>
        {productVisibilities.map((item) => (
          <option key={item} value={item}>
            {visibilityLabels[item]}
          </option>
        ))}
      </select>
      <select name="sort" defaultValue={sort ?? "newest"} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="title_asc">Title A-Z</option>
        <option value="title_desc">Title Z-A</option>
        <option value="price_desc">Highest price</option>
        <option value="price_asc">Lowest price</option>
        <option value="inventory_asc">Lowest inventory</option>
      </select>
      <Button type="submit">Apply</Button>
    </form>
  );
}
