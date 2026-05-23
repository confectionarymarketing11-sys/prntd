import { updateSiteSettingsAction } from "@/features/site-settings/actions/site-settings";
import { getSiteSettings } from "@/features/site-settings/data/site-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

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
