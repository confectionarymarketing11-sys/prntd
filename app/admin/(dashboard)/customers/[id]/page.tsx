import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import CustomerAnalyticsCard from "@/features/customers/components/CustomerAnalyticsCard";
import CustomerOrderHistory from "@/features/customers/components/CustomerOrderHistory";
import CustomerProfileCard from "@/features/customers/components/CustomerProfileCard";
import { addCustomerNoteAction } from "@/features/customers/actions/customers";
import { getCustomerById } from "@/features/customers/data/customers";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3">
          <Link href="/admin/customers"><ArrowLeft className="h-4 w-4" />Back to customers</Link>
        </Button>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{customer.name || customer.email}</h1>
        <p className="mt-2 text-sm text-slate-500">Customer profile, activity, and fulfillment context.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <CustomerAnalyticsCard customer={customer} />
          <CustomerOrderHistory orders={customer.orders} />
          <Card>
            <CardHeader><CardTitle>Customer Reviews</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              {customer.reviews.length ? customer.reviews.map((review) => (
                <div key={review.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black">{review.title || `${review.rating}/5 review`}</p>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{review.status}</p>
                  </div>
                  <p className="mt-2 leading-6 text-slate-700">{review.body}</p>
                  <p className="mt-2 text-xs text-slate-500">{review.product_id || "All products"}</p>
                </div>
              )) : <p className="text-sm text-slate-500">No customer reviews yet.</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Uploads, Artwork, And Print Files</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {customer.uploads.length ? customer.uploads.map((upload) => (
                <a key={upload.id} href={upload.file_url ?? upload.preview_url ?? "#"} target="_blank" className="rounded-xl border border-slate-200 p-3 text-sm text-slate-950 no-underline" rel="noreferrer">
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {upload.preview_url || upload.file_url ? <img src={upload.preview_url ?? upload.file_url ?? ""} alt="" className="h-full w-full object-contain" /> : null}
                  </div>
                  <p className="mt-2 truncate font-bold">{upload.file_name ?? "Design upload"}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {[upload.asset_role, upload.print_side].filter(Boolean).join(" · ") || upload.upload_status}
                  </p>
                </a>
              )) : <p className="text-sm text-slate-500">No uploads yet.</p>}
            </CardContent>
          </Card>
        </div>

        <aside className="grid h-fit gap-6">
          <CustomerProfileCard customer={customer} />
          <Card>
            <CardHeader><CardTitle>Addresses</CardTitle></CardHeader>
            <CardContent className="grid gap-3 text-sm">
              {customer.addresses.length ? customer.addresses.map((address) => (
                <div key={address.id} className="rounded-xl border border-slate-200 p-3">
                  <p className="font-black">{address.label}</p>
                  <p className="mt-1 text-slate-600">{[address.address_line1, address.address_line2, address.city, address.region, address.postal_code, address.country].filter(Boolean).join(", ")}</p>
                </div>
              )) : <p className="text-slate-500">No saved addresses.</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <form action={addCustomerNoteAction} className="grid gap-3">
                <input type="hidden" name="customerId" value={customer.id} />
                <Textarea name="note" rows={4} placeholder="Add an internal customer note" />
                <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="pinned" />Pinned</label>
                <Button type="submit">Add Note</Button>
              </form>
              <div className="grid gap-2">
                {customer.customer_notes.map((note) => (
                  <div key={note.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                    <p>{note.note}</p>
                    <p className="mt-2 text-xs text-slate-500">{note.author_email} · {new Date(note.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
