import { Archive, Eye, EyeOff } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { setProductStatusAction } from "@/features/products/actions/products";
import type { ProductStatus } from "@/features/products/types/product";

function StatusButton({
  productId,
  status,
  label,
  icon,
  variant = "outline",
}: {
  productId: string;
  status: ProductStatus;
  label: string;
  icon: ReactNode;
  variant?: "outline" | "secondary" | "destructive";
}) {
  return (
    <form action={setProductStatusAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" size="sm" variant={variant}>
        {icon}
        {label}
      </Button>
    </form>
  );
}

export default function ProductQuickActions({ productId, status }: { productId: string; status: ProductStatus }) {
  return (
    <div className="flex flex-wrap gap-2">
      {status !== "active" && <StatusButton productId={productId} status="active" label="Publish" icon={<Eye className="h-4 w-4" />} />}
      {status === "active" && <StatusButton productId={productId} status="draft" label="Unpublish" icon={<EyeOff className="h-4 w-4" />} />}
      {status !== "archived" && (
        <StatusButton productId={productId} status="archived" label="Archive" icon={<Archive className="h-4 w-4" />} variant="secondary" />
      )}
    </div>
  );
}
