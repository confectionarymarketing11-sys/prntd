import { updateShipmentAction } from "@/features/admin/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FulfillmentOrder } from "@/features/admin/types/database";

export default function ShipmentForm({ order }: { order: FulfillmentOrder }) {
  const shipment = order.shipments?.[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={updateShipmentAction} className="grid gap-3">
          <input type="hidden" name="orderId" value={order.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-semibold">
              Provider
              <select name="provider" defaultValue={shipment?.provider ?? "manual"} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
                <option value="manual">Manual</option>
                <option value="shippo">Shippo</option>
                <option value="shipstation">ShipStation</option>
                <option value="easypost">EasyPost</option>
                <option value="canada_post">Canada Post</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Shipment Status
              <select name="status" defaultValue={shipment?.status ?? "not_started"} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
                <option value="not_started">Not Started</option>
                <option value="label_created">Label Created</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="exception">Exception</option>
                <option value="returned">Returned</option>
              </select>
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="carrier" defaultValue={shipment?.carrier ?? ""} placeholder="Carrier" />
            <Input name="serviceLevel" defaultValue={shipment?.service_level ?? ""} placeholder="Service level" />
          </div>
          <Input name="trackingNumber" defaultValue={shipment?.tracking_number ?? ""} placeholder="Tracking number" />
          <Input name="trackingUrl" defaultValue={shipment?.tracking_url ?? ""} placeholder="Tracking URL" />
          <Input name="labelUrl" defaultValue={shipment?.label_url ?? ""} placeholder="Label URL" />
          <Button type="submit">Save Shipping</Button>
        </form>
      </CardContent>
    </Card>
  );
}
