import AuthForm from "@/components/auth/AuthForm";
import ShopHeader from "@/components/ShopHeader";

import {
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import {
  redirectIfCustomerLoggedIn,
} from "@/lib/auth/customer";

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
      {/* BG */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[#4f46e5]/20 blur-[140px]" />

        <div className="absolute bottom-[-15%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[#2563eb]/20 blur-[160px]" />
      </div>

      <div className="relative z-10">
        <ShopHeader />

        <section className="mx-auto grid min-w-0 min-h-[calc(100vh-88px)] w-full max-w-[1700px] items-center gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,560px)]">
          {/* LEFT */}
          <div className="relative min-w-0 overflow-hidden rounded-[42px] border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#312e81_100%)] p-8 shadow-[0_35px_120px_rgba(0,0,0,0.45)] sm:p-14">
            <div className="absolute right-[-10%] top-[-10%] h-[340px] w-[340px] rounded-full bg-[#8b5cf6]/20 blur-[120px]" />

            <div className="relative z-10 min-w-0">
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#c7d2fe]">
                <Sparkles className="h-4 w-4 shrink-0" />
                PRNTD Creator Portal
              </div>

              <h1 className="mt-8 break-words text-[clamp(54px,7vw,110px)] font-black leading-[0.9] tracking-[-0.06em]">
                Welcome
                <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                  Back
                </span>
              </h1>

              <p className="mt-8 max-w-2xl text-base leading-8 text-[#cbd5e1] sm:text-lg sm:leading-9">
                Access your premium
                creator dashboard,
                design tools,
                saved artwork,
                QR management,
                subscriptions,
                and storefront
                orders.
              </p>

              {/* FEATURES */}
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {[
                  "Design Creator",
                  "Saved Design Vault",
                  "Dynamic QR Tools",
                  "Premium Print Orders",
                ].map((item) => (
                  <div
                    key={item}
                    className="min-w-0 rounded-[24px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <ShieldCheck className="h-5 w-5 shrink-0 text-[#818cf8]" />

                      <p className="truncate text-sm font-black">
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
                    "Saved Designs",
                    "App Powered",
                    "Print Ready",
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
          <div className="min-w-0 overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_35px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
            <div className="min-w-0">
              <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#818cf8]">
                  Secure Account Access
                </p>

                <h2 className="mt-4 break-words text-[42px] font-black leading-[0.95] tracking-[-0.04em] sm:text-[48px]">
                  Sign In
                </h2>

                <p className="mt-4 text-[15px] leading-8 text-[#cbd5e1]">
                  Continue into your
                  PRNTD creator
                  workspace.
                </p>
              </div>

              {/* FORM CARD */}
              <div className="min-w-0 overflow-hidden rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-4 sm:p-6">
                <div className="min-w-0">
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
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}