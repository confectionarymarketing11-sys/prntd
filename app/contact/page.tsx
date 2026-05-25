import Link from "next/link";

import ShopHeader from "@/components/ShopHeader";
import { getSiteSettings } from "@/features/site-settings/data/site-settings";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* BACKGROUND EFFECTS */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[#4f46e5]/20 blur-[140px]" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[#2563eb]/20 blur-[160px]" />
      </div>

      <div className="relative z-10">
        <ShopHeader />

        {/* HERO */}
        <section className="mx-auto w-full max-w-7xl px-5 pt-16">
          <div className="overflow-hidden rounded-[42px] border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#111827_40%,#312e81_100%)] px-8 py-14 shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:px-14 sm:py-20">
            <div className="max-w-4xl">
              <div className="inline-flex rounded-full border border-[#6366f1]/30 bg-white/5 px-5 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#a5b4fc] backdrop-blur">
                Contact PRNTD
              </div>

              <h1 className="mt-7 text-[clamp(56px,8vw,110px)] font-black leading-[0.92] tracking-[-0.05em]">
                Let’s Build
                <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                  Something Premium
                </span>
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-9 text-[#cbd5e1]">
                {settings.contact_body ||
                  "Connect with PRNTD for custom printing, branded merchandise, business cards, stickers, apparel, design tools, and premium ecommerce solutions."}
              </p>
            </div>
          </div>
        </section>

        {/* CONTACT GRID */}
        <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* LEFT PANEL */}
          <div className="rounded-[36px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl shadow-[0_25px_90px_rgba(0,0,0,0.4)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#818cf8]">
              Contact Information
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em]">
              Reach Out To PRNTD
            </h2>

            <p className="mt-5 max-w-2xl text-[15px] leading-8 text-[#94a3b8]">
              Questions about orders, custom apparel, stickers, branding,
              QR systems, or premium business printing? Contact us directly
              and we’ll help bring your project to life.
            </p>

            <div className="mt-10 grid gap-5">
              {[
                {
                  label: "Email",
                  value: settings.contact_email,
                },
                {
                  label: "Phone",
                  value: settings.contact_phone,
                },
                {
                  label: "Address",
                  value: settings.contact_address,
                },
                {
                  label: "Hours",
                  value: settings.contact_hours,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[26px] border border-white/10 bg-[#0f172a]/80 p-6"
                >
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#818cf8]">
                    {item.label}
                  </p>

                  <p className="mt-3 text-xl font-black text-white">
                    {item.value || "Not set"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,#111827_0%,#1e1b4b_100%)] p-8 shadow-[0_25px_90px_rgba(0,0,0,0.45)]">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#c7d2fe]">
              Premium Support
            </div>

            <h2 className="mt-6 text-[clamp(40px,5vw,68px)] font-black leading-[0.95] tracking-[-0.04em]">
              Start Your
              <span className="block text-[#a5b4fc]">
                Next Project
              </span>
            </h2>

            <p className="mt-6 text-[15px] leading-8 text-[#cbd5e1]">
              PRNTD helps creators, businesses, and brands launch
              premium printed products backed by modern design systems
              and ecommerce tools.
            </p>

            <div className="mt-10 grid gap-5">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
                <p className="text-sm font-black text-white">
                  Apparel Printing
                </p>

                <p className="mt-2 text-sm leading-7 text-[#94a3b8]">
                  Premium t-shirts, hoodies, uniforms, and branded apparel.
                </p>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
                <p className="text-sm font-black text-white">
                  Business Branding
                </p>

                <p className="mt-2 text-sm leading-7 text-[#94a3b8]">
                  Business cards, stickers, QR campaigns, and brand assets.
                </p>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
                <p className="text-sm font-black text-white">
                  Design Tools
                </p>

                <p className="mt-2 text-sm leading-7 text-[#94a3b8]">
                  Generate print-ready graphics, remove backgrounds,
                  and create branded assets instantly.
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href={`mailto:${settings.contact_email || ""}`}
                className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] px-7 py-4 text-sm font-black text-white no-underline shadow-[0_15px_50px_rgba(99,102,241,0.45)] transition hover:-translate-y-1"
              >
                Email PRNTD
              </a>

              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-4 text-sm font-black text-white no-underline transition hover:bg-white/[0.08]"
              >
                Shop Products
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
