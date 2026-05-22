import { Badge } from "@/components/ui/badge";
import type { PaymentStatus, ProductionStatus, ShipmentStatus } from "@/features/admin/types/database";

const statusLabel: Record<ProductionStatus | PaymentStatus | ShipmentStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  printing: "Printing",
  cutting: "Cutting",
  packing: "Packing",
  shipped: "Shipped",
  completed: "Completed",
  unpaid: "Unpaid",
  authorized: "Authorized",
  paid: "Paid",
  refunded: "Refunded",
  failed: "Failed",
  not_started: "Not Started",
  label_created: "Label Created",
  in_transit: "In Transit",
  delivered: "Delivered",
  exception: "Exception",
  returned: "Returned",
};

export function StatusBadge({ status }: { status: ProductionStatus | PaymentStatus | ShipmentStatus }) {
  const variant =
    status === "completed" || status === "paid" || status === "delivered"
      ? "success"
      : status === "failed" || status === "exception" || status === "returned"
        ? "destructive"
        : status === "printing" || status === "cutting" || status === "packing" || status === "in_transit"
          ? "info"
          : status === "pending" || status === "unpaid"
            ? "warning"
            : "secondary";

  return <Badge variant={variant}>{statusLabel[status]}</Badge>;
}

export function productionStatusLabel(status: ProductionStatus) {
  return statusLabel[status];
}
