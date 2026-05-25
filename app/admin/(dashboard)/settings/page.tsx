import { updateSiteSettingsAction } from "@/features/site-settings/actions/site-settings";
import { getSiteSettings } from "@/features/site-settings/data/site-settings";
import { getShippingRates } from "@/features/shipping/data/shipping";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  const shippingRates = await getShippingRates({ includeInactive: true });

  return (
    <form action={updateSiteSettingsAction} className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Site Settings</h1>
        <p className="mt-2 text-sm text-slate-500">Announcement bar, logo, contact details, policies, and storefront preferences.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Test Mode</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="test_mode_enabled" defaultChecked={settings.test_mode_enabled} />
            Enable test mode across storefront and checkout
          </label>
          <Input name="test_mode_notice" defaultValue={settings.test_mode_notice} placeholder="Test mode notice" />
          <p className="text-sm text-slate-500">
            Checkout will use Stripe test keys when <code>STRIPE_TEST_SECRET_KEY</code> is configured; otherwise it stays on the configured Stripe key and labels sessions as test mode.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Announcement Bar</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="announcement_enabled" defaultChecked={settings.announcement_enabled} />
            Show announcement bar
          </label>
          <Input name="announcement_text" defaultValue={settings.announcement_text} placeholder="Announcement text" />
          <Input name="announcement_link" defaultValue={settings.announcement_link ?? ""} placeholder="/products or https://..." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Logo</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input name="logo_text" defaultValue={settings.logo_text} placeholder="Logo text" />
          <Input name="logo_subtitle" defaultValue={settings.logo_subtitle} placeholder="Logo subtitle" />
          <Input name="logo_image_url" defaultValue={settings.logo_image_url ?? ""} placeholder="Logo image URL" className="md:col-span-2" />
        </CardContent>
      </Card>

      <Card id="contact">
        <CardHeader><CardTitle>Contact Section</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input name="contact_email" defaultValue={settings.contact_email} placeholder="Contact email" />
          <Input name="contact_phone" defaultValue={settings.contact_phone ?? ""} placeholder="Phone" />
          <Input name="contact_address" defaultValue={settings.contact_address ?? ""} placeholder="Address" />
          <Input name="contact_hours" defaultValue={settings.contact_hours ?? ""} placeholder="Hours" />
          <Textarea name="contact_body" defaultValue={settings.contact_body ?? ""} rows={5} className="md:col-span-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Terms And Policies</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <Textarea name="terms_body" defaultValue={settings.terms_body ?? ""} rows={6} placeholder="Terms of service" />
          <Textarea name="privacy_body" defaultValue={settings.privacy_body ?? ""} rows={6} placeholder="Privacy policy" />
          <Textarea name="refund_body" defaultValue={settings.refund_body ?? ""} rows={6} placeholder="Refund policy" />
          <Textarea name="shipping_body" defaultValue={settings.shipping_body ?? ""} rows={6} placeholder="Shipping policy" />
        </CardContent>
      </Card>

      <Card id="shipping">
        <CardHeader>
          <CardTitle>Shipping Options</CardTitle>
          <p className="text-sm text-slate-500">
            These rates are the source of truth for cart totals, Stripe Checkout, and order records.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          {shippingRates.map((rate, index) => (
            <div key={rate.code} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">{rate.code.replace("_", " ")}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Keep the code stable. Edit labels, rates, thresholds, and active state here.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-700">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" name={`shipping_active_${index}`} defaultChecked={rate.active} />
                    Active
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" name={`shipping_requires_tracking_${index}`} defaultChecked={rate.requires_tracking} />
                    Tracking
                  </label>
                </div>
              </div>

              <input type="hidden" name="shipping_code" value={rate.code} />

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <label className="grid gap-1 text-sm font-semibold">
                  Name
                  <Input name={`shipping_name_${index}`} defaultValue={rate.name} />
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  Price CAD
                  <Input name={`shipping_amount_${index}`} defaultValue={(rate.amount_cents / 100).toFixed(2)} inputMode="decimal" />
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  Free over CAD
                  <Input
                    name={`shipping_free_over_${index}`}
                    defaultValue={rate.free_over_cents === null ? "" : (rate.free_over_cents / 100).toFixed(2)}
                    inputMode="decimal"
                    placeholder="No threshold"
                  />
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  Type
                  <select
                    name={`shipping_method_type_${index}`}
                    defaultValue={rate.method_type}
                    className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="lettermail">Lettermail</option>
                    <option value="tracked">Tracked</option>
                    <option value="local_pickup">Local Pickup</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-semibold md:col-span-2 xl:col-span-4">
                  Description
                  <Input name={`shipping_description_${index}`} defaultValue={rate.description ?? ""} />
                </label>
                <input type="hidden" name={`shipping_min_subtotal_${index}`} value={(rate.min_subtotal_cents / 100).toFixed(2)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Currency And Language</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Input name="default_currency" defaultValue={settings.default_currency} placeholder="CAD" />
          <Input name="supported_currencies" defaultValue={settings.supported_currencies.join(",")} placeholder="CAD,USD" />
          <Input name="supported_languages" defaultValue={settings.supported_languages.join(",")} placeholder="en,fr" />
        </CardContent>
      </Card>

      <Button type="submit" className="w-fit">Save Settings</Button>
    </form>
  );
}
