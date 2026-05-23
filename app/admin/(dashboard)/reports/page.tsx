import { Download } from "lucide-react";
import Link from "next/link";
import { getTaxReport, formatReportCents } from "@/features/reports/data/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const params = await searchParams;
  const currentYear = new Date().getFullYear();
  const year = Number(params.year ?? currentYear) || currentYear;
  const report = await getTaxReport(year);
  const years = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Tax Reports</h1>
          <p className="mt-2 text-sm text-slate-500">End-of-year financial information, including last year, based on paid Stripe orders.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {years.map((item) => (
            <Link key={item} href={`/admin/reports?year=${item}`} className={`rounded-lg border px-3 py-2 text-sm font-bold no-underline ${item === year ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700"}`}>
              {item}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Paid orders", String(report.totals.orderCount)],
          ["Gross sales", formatReportCents(report.totals.subtotalCents, report.currency)],
          ["Tax collected", formatReportCents(report.totals.taxCents, report.currency)],
          ["Total collected", formatReportCents(report.totals.totalCents, report.currency)],
        ].map(([label, value]) => (
          <Card key={label}><CardContent className="p-5"><p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{year} Monthly Tax Summary</CardTitle>
          <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700" aria-label="Export coming soon">
            <Download className="h-4 w-4" />
            CSV-ready
          </button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Discounts</TableHead>
                <TableHead>Shipping</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...report.monthly, report.totals].map((row) => (
                <TableRow key={row.month} className={row.month === "Total" ? "font-black" : ""}>
                  <TableCell>{row.month}</TableCell>
                  <TableCell>{row.orderCount}</TableCell>
                  <TableCell>{formatReportCents(row.subtotalCents, report.currency)}</TableCell>
                  <TableCell>{formatReportCents(row.discountCents, report.currency)}</TableCell>
                  <TableCell>{formatReportCents(row.shippingCents, report.currency)}</TableCell>
                  <TableCell>{formatReportCents(row.taxCents, report.currency)}</TableCell>
                  <TableCell className="text-right">{formatReportCents(row.totalCents, report.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
