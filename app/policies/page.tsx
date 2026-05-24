import ShopHeader from "@/components/ShopHeader";

import {
  getSiteSettings,
} from "@/features/site-settings/data/site-settings";

export const dynamic =
  "force-dynamic";

export default async function PoliciesPage() {
  const settings =
    await getSiteSettings();

  const policies = [
    [
      "Terms of Service",
      settings.terms_body,
    ],
    [
      "Privacy Policy",
      settings.privacy_body,
    ],
    [
      "Refund Policy",
      settings.refund_body,
    ],
    [
      "Shipping Policy",
      settings.shipping_body,
    ],
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      {/* BG */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-[#4f46e5]/15 blur-[120px]" />

        <div className="absolute bottom-[-10%] right-[-10%] h-[420px] w-[420px] rounded-full bg-[#2563eb]/15 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <ShopHeader />

        <section className="mx-auto grid w-full max-w-5xl gap-6 px-5 py-12">
          {/* HERO */}
          <header className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#1e1b4b_100%)] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.4)] sm:p-10">
            <div className="absolute right-[-10%] top-[-20%] h-[280px] w-[280px] rounded-full bg-[#6366f1]/20 blur-[90px]" />

            <div className="relative z-10">
              <p className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#c7d2fe]">
                Policies
              </p>

              <h1 className="mt-5 text-[clamp(42px,5vw,74px)] font-black leading-[0.95] tracking-[-0.06em]">
                Terms &
                <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                  Policies
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-[#cbd5e1]">
                Review our terms,
                privacy standards,
                refunds, and shipping
                policies for purchases
                and creator services.
              </p>
            </div>
          </header>

          {/* POLICIES */}
          <div className="grid gap-6">
            {policies.map(
              ([title, body]) => (
                <article
                  key={title}
                  className="rounded-[30px] border border-white/10 bg-[#0f172a]/80 p-7 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                        Legal
                      </p>

                      <h2 className="mt-2 text-3xl font-black text-white">
                        {title}
                      </h2>
                    </div>

                    <div className="h-3 w-3 rounded-full bg-[#818cf8]" />
                  </div>

                  <div className="mt-6 rounded-[24px] border border-white/10 bg-[#020617] p-6">
                    <p className="whitespace-pre-wrap text-sm leading-8 text-[#cbd5e1]">
                      {body ||
                        "Policy details will be added before launch."}
                    </p>
                  </div>
                </article>
              ),
            )}
          </div>
        </section>
      </div>
    </main>
  );
}