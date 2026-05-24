import {
  CreditCard,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  User2,
} from "lucide-react";

import LogoutButton from "@/components/account/LogoutButton";
import PasswordUpdateForm from "@/components/account/PasswordUpdateForm";

import PortalSidebar from "@/components/PortalSidebar";
import ShopHeader from "@/components/ShopHeader";

import { fetchCustomerProfile } from "@/lib/account/customer-data";
import { requireCustomerUser } from "@/lib/auth/customer";

export default async function AccountSettingsPage() {
  const user =
    await requireCustomerUser();

  const customer =
    await fetchCustomerProfile(
      user.email ?? "",
    );

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* BG */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[#4f46e5]/20 blur-[140px]" />

        <div className="absolute bottom-[-15%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[#2563eb]/20 blur-[160px]" />
      </div>

      <div className="relative z-10">
        <ShopHeader />

        <section className="mx-auto flex w-full max-w-[1700px] gap-6 px-5 py-10 max-[1100px]:flex-col">
          <PortalSidebar />

          <div className="min-w-0 flex-1">
            {/* HERO */}
            <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#111827_40%,#312e81_100%)] p-8 shadow-[0_35px_120px_rgba(0,0,0,0.45)] sm:p-10">
              <div className="absolute right-[-10%] top-[-10%] h-[320px] w-[320px] rounded-full bg-[#8b5cf6]/20 blur-[120px]" />

              <div className="relative flex flex-wrap items-end justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#c7d2fe]">
                    <Sparkles className="h-4 w-4" />
                    Secure Creator Portal
                  </div>

                  <h1 className="mt-7 text-[clamp(52px,6vw,92px)] font-black leading-[0.92] tracking-[-0.06em]">
                    Account
                    <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                      Settings
                    </span>
                  </h1>

                  <p className="mt-6 max-w-3xl text-lg leading-9 text-[#cbd5e1]">
                    Manage your creator
                    account, subscription
                    access, customer
                    information, and
                    account security.
                  </p>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                    Account Status
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-[#22c55e]" />

                    <p className="text-lg font-black">
                      Secure & Active
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* GRID */}
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              {/* ACCOUNT */}
              <article className="overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-2xl shadow-[0_25px_90px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-[20px] bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] shadow-[0_15px_50px_rgba(99,102,241,0.35)]">
                    <User2 className="h-6 w-6 text-white" />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                      Creator Profile
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                      Account
                    </h2>
                  </div>
                </div>

                {/* EMAIL */}
                <div className="mt-8 rounded-[28px] border border-white/10 bg-[#0f172a]/70 p-6">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                    Email Address
                  </p>

                  <p className="mt-3 break-all text-xl font-black">
                    {user.email}
                  </p>
                </div>

                {/* STRIPE */}
                <div className="mt-5 rounded-[28px] border border-white/10 bg-[#0f172a]/70 p-6">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-[#818cf8]" />

                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                      Stripe Customer
                    </p>
                  </div>

                  <p className="mt-4 break-all text-sm font-bold text-[#cbd5e1]">
                    {customer?.stripe_customer_id ??
                      "Not linked yet"}
                  </p>
                </div>

                {/* SUB */}
                <div className="mt-5 rounded-[28px] border border-white/10 bg-[#0f172a]/70 p-6">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                    Subscription
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <div className="rounded-full border border-[#22c55e]/20 bg-[#22c55e]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#86efac]">
                      {customer?.subscription_status ??
                        "inactive"}
                    </div>

                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#cbd5e1]">
                      {customer?.plan_tier ??
                        "none"}
                    </div>
                  </div>
                </div>

                {/* LOGOUT */}
                <div className="mt-8">
                  <LogoutButton />
                </div>
              </article>

              {/* PASSWORD */}
              <article className="overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-2xl shadow-[0_25px_90px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-[20px] bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] shadow-[0_15px_50px_rgba(99,102,241,0.35)]">
                    <LockKeyhole className="h-6 w-6 text-white" />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                      Account Security
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                      Password
                    </h2>
                  </div>
                </div>

                <div className="mt-8 rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-6">
                  <div className="mb-6 rounded-[24px] border border-[#22c55e]/15 bg-[#22c55e]/10 p-5">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-[#22c55e]" />

                      <p className="text-sm font-black text-[#86efac]">
                        Secure Password
                        Encryption Enabled
                      </p>
                    </div>

                    <p className="mt-3 text-sm leading-7 text-[#cbd5e1]">
                      Update your password
                      regularly to maintain
                      account security and
                      protect your creator
                      assets.
                    </p>
                  </div>

                  <PasswordUpdateForm />
                </div>
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}