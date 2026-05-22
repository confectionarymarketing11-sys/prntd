import Link from "next/link";
import { ArrowUpDown, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaymentStatusSelect, ProductionStatusSelect } from "@/features/admin/components/order-status-select";
import { StatusBadge } from "@/features/admin/components/status-badge";
import { formatCents } from "@/features/admin/data/orders";
import type { PaginatedOrders } from "@/features/admin/types/database";

export default function OrdersTable({ data }: { data: PaginatedOrders }) {
  if (!data.orders.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="font-semibold">No orders match this view.</p>
          <p className="mt-2 text-sm text-slate-500">Try clearing filters or waiting for storefront checkout to sync.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>
                <span className="inline-flex items-center gap-2">
                  Total <ArrowUpDown className="h-3.5 w-3.5" />
                </span>
              </TableHead>
              <TableHead>Shipments</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link href={`/admin/orders/${order.id}`} className="font-black text-slate-950 no-underline hover:underline">
                    {order.order_number}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">{new Date(order.created_at).toLocaleString()}</p>
                </TableCell>
                <TableCell>
                  <p className="font-semibold">{order.customer_name || order.customer?.name || "Unknown"}</p>
                  <p className="text-xs text-slate-500">{order.customer_email}</p>
                </TableCell>
                <TableCell>
                  <div className="grid gap-2">
                    <StatusBadge status={order.production_status} />
                    <ProductionStatusSelect orderId={order.id} value={order.production_status} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="grid gap-2">
                    <StatusBadge status={order.payment_status} />
                    <PaymentStatusSelect orderId={order.id} value={order.payment_status} />
                  </div>
                </TableCell>
                <TableCell className="font-black">{formatCents(order.total_cents, order.currency)}</TableCell>
                <TableCell>
                  {order.shipments?.length ? (
                    <div className="grid gap-1">
                      {order.shipments.map((shipment) => (
                        <StatusBadge key={shipment.id} status={shipment.shipment_status} />
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500">No label</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/orders/${order.id}`}>
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/orders/${order.id}#artwork`}>
                        <Download className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
