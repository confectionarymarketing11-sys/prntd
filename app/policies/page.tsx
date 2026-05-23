import ShopHeader from "@/components/ShopHeader";
import { getSiteSettings } from "@/features/site-settings/data/site-settings";

export const dynamic = "force-dynamic";

export default async function PoliciesPage() {
  const settings = await getSiteSettings();
  const policies = [
    ["Terms of Service", settings.terms_body],
    ["Privacy Policy", settings.privacy_body],
    ["Refund Policy", settings.refund_body],
    ["Shipping Policy", settings.shipping_body],
  ];

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <ShopHeader />
      <section className="mx-auto grid w-full max-w-4xl gap-5 px-5 py-12">
        <div className="rounded-[30px] border border-white/70 bg-white p-8 shadow-[0_12px_38px_rgba(0,0,0,0.06)]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4f46e5]">Policies</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">Terms and policies</h1>
        </div>
        {policies.map(([title, body]) => (
          <article key={title} className="rounded-[24px] border border-white/70 bg-white p-7 shadow-[0_10px_28px_rgba(0,0,0,0.05)]">
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#4b5563]">{body || "Policy details will be added before launch."}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
