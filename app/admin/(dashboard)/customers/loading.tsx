import { Skeleton } from "@/components/ui/skeleton";

export default function CustomersLoading() {
  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <Skeleton className="h-20 w-full" />
      <div className="grid gap-3 md:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-[520px] w-full" />
    </div>
  );
}
