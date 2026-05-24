import AuthForm from "@/components/auth/AuthForm";
import ShopHeader from "@/components/ShopHeader";

import { Sparkles, ShieldCheck } from "lucide-react";

import { redirectIfCustomerLoggedIn } from "@/lib/auth/customer";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string;
    message?: string;
  }>;
}) {
  await redirectIfCustomerLoggedIn();

  const params =
    await searchParams;

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[#4f46e5]/20 blur-[140px]" />

        <div className="absolute bottom-[-15%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[#2563eb]/20 blur-[160px]" />
      </div>

      <div className="relative z-10">
        <ShopHeader />

        <section className="mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-[1700px] items-center gap-8 px-5 py-10 lg:grid-cols-[1.1fr_560px]">
          {/* LEFT */}
          <div className="relative overflow-hidden rounded-[42px] border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#312e81_100%)] p-10 shadow-[0_35px_120px_rgba(0,0,0,0.45)] sm:p-14">
            <div className="absolute right-[-10%] top-[-10%] h-[340px] w-[340px] rounded-full bg-[#8b5cf6]/20 blur-[120px]" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#c7d2fe]">
                <Sparkles className="h-4 w-4" />
                PRNTD Creator Portal
              </div>

              <h1 className="mt-8 text-[clamp(58px,7vw,110px)] font-black leading-[0.9] tracking-[-0.06em]">
                Welcome
                <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                  Back
                </span>
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-9 text-[#cbd5e1]">
                Access your premium
                creator dashboard,
                AI design tools,
                saved artwork,
                QR management,
                subscriptions,
                and storefront orders.
              </p>

              {/* FEATURES */}
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {[
                  "AI Design Generator",
                  "Saved Design Vault",
                  "Dynamic QR Tools",
                  "Premium Print Orders",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[24px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-[#818cf8]" />

                      <p className="text-sm font-black">
                        {item}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* STATUS */}
              <div className="mt-10 rounded-[30px] border border-white/10 bg-[#0f172a]/70 p-6 backdrop-blur-xl">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                  Premium Platform
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  {[
                    "Stripe Protected",
                    "Cloud Saved",
                    "AI Powered",
                    "Commercial Ready",
                  ].map((badge) => (
                    <div
                      key={badge}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black text-[#cbd5e1]"
                    >
                      {badge}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-2xl shadow-[0_35px_120px_rgba(0,0,0,0.45)] sm:p-8">
            <div className="mb-8">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#818cf8]">
                Secure Account Access
              </p>

              <h2 className="mt-4 text-[48px] font-black leading-[0.95] tracking-[-0.04em]">
                Sign In
              </h2>

              <p className="mt-4 text-[15px] leading-8 text-[#cbd5e1]">
                Continue into your
                PRNTD creator
                workspace.
              </p>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-6">
              <AuthForm
                mode="login"
                nextPath={
                  params.next ??
                  "/dashboard"
                }
                initialMessage={
                  params.message ??
                  ""
                }
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}