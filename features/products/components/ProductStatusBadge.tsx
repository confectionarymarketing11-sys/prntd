import { Badge } from "@/components/ui/badge";
import type { ProductStatus, ProductVisibility } from "@/features/products/types/product";

const statusLabels: Record<ProductStatus, string> = {
  draft: "Draft",
  active: "Active",
  archived: "Archived",
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const variant = status === "active" ? "success" : status === "archived" ? "secondary" : "warning";

  return <Badge variant={variant}>{statusLabels[status]}</Badge>;
}

export function ProductVisibilityBadge({ visibility }: { visibility: ProductVisibility }) {
  return <Badge variant={visibility === "online" ? "info" : "outline"}>{visibility === "online" ? "Online" : "Hidden"}</Badge>;
}
