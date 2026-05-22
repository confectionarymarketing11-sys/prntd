import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { DateRangeKey } from "@/features/analytics/types/analytics";

const ranges: { key: DateRangeKey; label: string }[] = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
];

export default function AnalyticsDateRange({ value }: { value: DateRangeKey }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ranges.map((range) => (
        <Button key={range.key} asChild variant={range.key === value ? "default" : "outline"} size="sm">
          <Link href={`/admin/analytics?range=${range.key}`}>{range.label}</Link>
        </Button>
      ))}
    </div>
  );
}
