import AuthForm from "@/components/auth/AuthForm";
import ShopHeader from "@/components/ShopHeader";

import {
  redirectIfCustomerLoggedIn,
} from "@/lib/auth/customer";

export default async function SignupPage() {
  await redirectIfCustomerLoggedIn();

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* BG */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[#4f46e5]/15 blur-[140px]" />

        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#2563eb]/15 blur-[140px]" />
      </div>

      <div className="relative z-10">
        <ShopHeader />

        <section className="mx-auto flex min-h-[calc(100vh-90px)] w-full max-w-7xl items-center px-5 py-14">
          <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_520px] lg:items-center">
            {/* LEFT */}
            <div>
              <div className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-5 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#c7d2fe]">
                Creator Platform
              </div>

              <h1 className="mt-7 text-[clamp(54px,7vw,110px)] font-black leading-[0.9] tracking-[-0.08em] text-white">
                Start
                <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                  Creating
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-9 text-[#cbd5e1]">
                Create an account to
                access AI-powered design
                tools, saved projects,
                creator features, and
                premium print workflows.
              </p>

              {/* FEATURE ROW */}
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  [
                    "AI Tools",
                    "Generate and edit premium artwork instantly.",
                  ],
                  [
                    "Saved Designs",
                    "Access your creations from any device.",
                  ],
                  [
                    "Premium Print",
                    "Launch products with streamlined workflows.",
                  ],
                ].map(
                  ([title, desc]) => (
                    <div
                      key={title}
                      className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl"
                    >
                      <p className="text-sm font-black text-white">
                        {title}
                      </p>

                      <p className="mt-3 text-sm leading-7 text-[#94a3b8]">
                        {desc}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div className="rounded-[34px] border border-white/10 bg-[#0f172a]/80 p-7 shadow-[0_25px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-9">
              <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                  Create Account
                </p>

                <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white">
                  Sign Up
                </h2>

                <p className="mt-4 text-sm leading-7 text-[#cbd5e1]">
                  Join the platform and
                  start building your
                  creator workspace.
                </p>
              </div>

              <AuthForm mode="signup" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}