import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerDetail } from "@/features/customers/types/customer";

export default function CustomerProfileCard({ customer }: { customer: CustomerDetail }) {
  return (
    <Card>
      <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div>
          <p className="text-xl font-black">{customer.name || "Unnamed customer"}</p>
          <p className="text-slate-500">{customer.email}</p>
          {customer.phone && <p className="text-slate-500">{customer.phone}</p>}
          {customer.company && <p className="text-slate-500">{customer.company}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={customer.account_status === "active" ? "success" : "secondary"}>{customer.account_status}</Badge>
          <Badge variant="outline">{customer.plan_tier}</Badge>
          <Badge variant="info">{customer.credits_balance} credits</Badge>
        </div>
        <p className="text-xs text-slate-500">Customer since {new Date(customer.created_at).toLocaleDateString()}</p>
      </CardContent>
    </Card>
  );
}
