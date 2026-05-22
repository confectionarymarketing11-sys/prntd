import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import ArtworkGallery from "@/features/admin/components/artwork-gallery";
import { JsonViewer } from "@/features/admin/components/json-viewer";
import { PaymentStatusSelect, ProductionStatusSelect } from "@/features/admin/components/order-status-select";
import ProductionTimeline from "@/features/admin/components/production-timeline";
import ShipmentForm from "@/features/admin/components/shipment-form";
import { StatusBadge } from "@/features/admin/components/status-badge";
import { formatCents, getOrderById } from "@/features/admin/data/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);

  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
              Back to orders
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{order.order_number}</h1>
            <StatusBadge status={order.production_status} />
            <StatusBadge status={order.payment_status} />
          </div>
          <p className="mt-2 text-sm text-slate-500">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <ProductionStatusSelect orderId={order.id} value={order.production_status} />
          <PaymentStatusSelect orderId={order.id} value={order.payment_status} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {(order.order_items ?? []).map((item) => (
                <article key={item.id} className="grid gap-4 rounded-xl border border-slate-200 p-4 md:grid-cols-[64px_minmax(0,1fr)_auto]">
                  <div className="grid h-16 w-16 place-items-center rounded-lg bg-slate-100">
                    <Package className="h-6 w-6 text-slate-500" />
                  </div>
                  <div>
                    <h2 className="font-black">{item.product_name}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Qty {item.quantity} {item.sku ? `/ SKU ${item.sku}` : ""}
                    </p>
                    {item.production_notes && <p className="mt-2 text-sm text-slate-700">{item.production_notes}</p>}
                  </div>
                  <p className="font-black">{formatCents(item.line_total_cents, order.currency)}</p>
                </article>
              ))}
            </CardContent>
          </Card>

          <ArtworkGallery uploads={order.uploads ?? []} />

          {(order.order_items ?? []).map((item) => (
            <JsonViewer key={item.id} title={`Customization JSON: ${item.product_name}`} data={item.customization} />
          ))}
        </div>

        <aside className="grid h-fit gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div>
                <p className="font-black">{order.customer_name || order.customer?.name || "Unknown customer"}</p>
                <p className="text-slate-500">{order.customer_email}</p>
                {order.customer_phone && <p className="text-slate-500">{order.customer_phone}</p>}
              </div>
              <Separator />
              <div>
                <p className="font-semibold">Shipping Address</p>
                <p className="mt-1 leading-6 text-slate-600">{Object.values(order.shipping_address ?? {}).filter(Boolean).join(", ")}</p>
              </div>
              {order.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="font-semibold">Notes</p>
                    <p className="mt-1 leading-6 text-slate-600">{order.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Totals</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <strong>{formatCents(order.subtotal_cents, order.currency)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <strong>{formatCents(order.shipping_cents, order.currency)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <strong>{formatCents(order.tax_cents, order.currency)}</strong>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg">
                <span className="font-black">Total</span>
                <strong>{formatCents(order.total_cents, order.currency)}</strong>
              </div>
            </CardContent>
          </Card>

          <ShipmentForm order={order} />
          <ProductionTimeline events={order.production_status_events ?? []} />
        </aside>
      </div>
    </div>
  );
}
