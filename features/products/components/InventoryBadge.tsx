import { Badge } from "@/components/ui/badge";

export default function InventoryBadge({ quantity }: { quantity: number }) {
  if (quantity <= 0) {
    return <Badge variant="destructive">Out of stock</Badge>;
  }

  if (quantity <= 5) {
    return <Badge variant="warning">{quantity} low</Badge>;
  }

  return <Badge variant="success">{quantity} in stock</Badge>;
}
