import Link from "next/link";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCustomerCents } from "@/features/customers/data/customers";
import type { PaginatedCustomers } from "@/features/customers/types/customer";

export default function CustomerTable({ data }: { data: PaginatedCustomers }) {
  if (!data.customers.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100"><Users className="h-6 w-6 text-slate-500" /></div>
          <p className="mt-4 font-semibold">No customers match this view.</p>
          <p className="mt-1 text-sm text-slate-500">Customer accounts will appear as people sign up or check out.</p>
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
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spend</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <Link href={`/admin/customers/${customer.id}`} className="font-black text-slate-950 no-underline hover:underline">
                    {customer.name || customer.email}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">{customer.email}</p>
                </TableCell>
                <TableCell><Badge variant={customer.account_status === "active" ? "success" : "secondary"}>{customer.account_status}</Badge></TableCell>
                <TableCell><Badge variant="outline">{customer.plan_tier}</Badge></TableCell>
                <TableCell>{customer.order_count}</TableCell>
                <TableCell className="font-black">{formatCustomerCents(customer.total_spend_cents)}</TableCell>
                <TableCell className="text-sm text-slate-500">{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right"><Button asChild size="sm" variant="outline"><Link href={`/admin/customers/${customer.id}`}>View</Link></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
