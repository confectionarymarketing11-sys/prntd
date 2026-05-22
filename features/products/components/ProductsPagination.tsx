import Link from "next/link";
import { Button } from "@/components/ui/button";

function makeHref(page: number, searchParams: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== "page") params.set(key, value);
  });
  params.set("page", String(page));

  return `/admin/products?${params.toString()}`;
}

export default function ProductsPagination({
  page,
  pageCount,
  searchParams,
}: {
  page: number;
  pageCount: number;
  searchParams: Record<string, string | undefined>;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Page {page} of {pageCount}
      </p>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm" aria-disabled={page <= 1}>
          <Link href={makeHref(Math.max(page - 1, 1), searchParams)}>Previous</Link>
        </Button>
        <Button asChild variant="outline" size="sm" aria-disabled={page >= pageCount}>
          <Link href={makeHref(Math.min(page + 1, pageCount), searchParams)}>Next</Link>
        </Button>
      </div>
    </div>
  );
}
