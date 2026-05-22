"use client";

import { useOptimistic, useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateOrderStatusAction, updatePaymentStatusAction } from "@/features/admin/actions/orders";
import {
  paymentStatuses,
  productionStatuses,
  type PaymentStatus,
  type ProductionStatus,
} from "@/features/admin/types/database";

const productionLabels: Record<ProductionStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  printing: "Printing",
  cutting: "Cutting",
  packing: "Packing",
  shipped: "Shipped",
  completed: "Completed",
};

const paymentLabels: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  authorized: "Authorized",
  paid: "Paid",
  refunded: "Refunded",
  failed: "Failed",
};

export function ProductionStatusSelect({ orderId, value }: { orderId: string; value: ProductionStatus }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(value);

  return (
    <Select
      value={optimisticStatus}
      onValueChange={(next) => {
        const status = next as ProductionStatus;
        setOptimisticStatus(status);
        startTransition(() => {
          void updateOrderStatusAction(orderId, status);
        });
      }}
    >
      <SelectTrigger className="min-w-[150px]" aria-disabled={isPending}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {productionStatuses.map((status) => (
          <SelectItem key={status} value={status}>
            {productionLabels[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function PaymentStatusSelect({ orderId, value }: { orderId: string; value: PaymentStatus }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(value);

  return (
    <Select
      value={optimisticStatus}
      onValueChange={(next) => {
        const status = next as PaymentStatus;
        setOptimisticStatus(status);
        startTransition(() => {
          void updatePaymentStatusAction(orderId, status);
        });
      }}
    >
      <SelectTrigger className="min-w-[140px]" aria-disabled={isPending}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {paymentStatuses.map((status) => (
          <SelectItem key={status} value={status}>
            {paymentLabels[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
