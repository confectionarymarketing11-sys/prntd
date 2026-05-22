import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CustomersFilterBar({ search, status, plan, sort }: { search?: string; status?: string; plan?: string; sort?: string }) {
  return (
    <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_150px_150px_170px_auto]">
      <label className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input name="search" defaultValue={search ?? ""} placeholder="Search name, email, phone" className="pl-9" />
      </label>
      <select name="status" defaultValue={status ?? "all"} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
        <option value="all">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="blocked">Blocked</option>
      </select>
      <select name="plan" defaultValue={plan ?? "all"} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
        <option value="all">All plans</option>
        <option value="none">None</option>
        <option value="starter">Starter</option>
        <option value="pro">Pro</option>
        <option value="business">Business</option>
      </select>
      <select name="sort" defaultValue={sort ?? "newest"} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="spend_desc">Highest spend</option>
        <option value="orders_desc">Most orders</option>
      </select>
      <Button type="submit">Apply</Button>
    </form>
  );
}
