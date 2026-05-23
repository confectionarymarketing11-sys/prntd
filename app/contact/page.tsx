import ShopHeader from "@/components/ShopHeader";
import { getSiteSettings } from "@/features/site-settings/data/site-settings";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <ShopHeader />
      <section className="mx-auto grid w-full max-w-5xl gap-6 px-5 py-12">
        <div className="rounded-[30px] border border-white/70 bg-white p-8 shadow-[0_12px_38px_rgba(0,0,0,0.06)]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4f46e5]">Contact</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">Talk to PRNTD</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#6b7280]">{settings.contact_body}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Email", settings.contact_email],
            ["Phone", settings.contact_phone],
            ["Address", settings.contact_address],
            ["Hours", settings.contact_hours],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[24px] border border-white/70 bg-white p-6 shadow-[0_10px_28px_rgba(0,0,0,0.05)]">
              <p className="text-xs font-black uppercase tracking-wide text-[#6b7280]">{label}</p>
              <p className="mt-2 text-lg font-black">{value || "Not set"}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
