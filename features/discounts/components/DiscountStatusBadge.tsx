import { Badge } from "@/components/ui/badge";
import type { DiscountStatus } from "@/features/discounts/types/discount";

const labels: Record<DiscountStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  expired: "Expired",
  scheduled: "Scheduled",
};

export default function DiscountStatusBadge({ status }: { status: DiscountStatus }) {
  const variant = status === "active" ? "success" : status === "scheduled" ? "info" : status === "expired" ? "secondary" : "warning";
  return <Badge variant={variant}>{labels[status]}</Badge>;
}
