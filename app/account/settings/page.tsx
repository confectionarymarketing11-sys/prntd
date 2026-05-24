import {
  CreditCard,
  LockKeyhole,
  ShieldCheck,
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
    <main className="min-h-screen bg-[#060816] text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[#4f46e5]/15 blur-[140px]" />

        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#2563eb]/15 blur-[140px]" />
      </div>

      <div className="relative z-10">
        <ShopHeader />

        <section className="mx-auto flex w-full max-w-[1500px] gap-8 px-6 py-10 max-[1100px]:flex-col">
          {/* LEFT SIDEBAR */}
          <PortalSidebar />

          {/* CONTENT */}
          <div className="min-w-0 flex-1">
            {/* TOP HEADER */}
            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#111827_50%,#1e1b4b_100%)] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#a5b4fc]">
                    <ShieldCheck className="h-4 w-4" />
                    Account Center
                  </div>

                  <h1 className="mt-5 text-5xl font-black tracking-[-0.05em] sm:text-6xl">
                    Settings
                  </h1>

                  <p className="mt-4 max-w-2xl text-base leading-8 text-[#cbd5e1]">
                    Manage your account,
                    billing, subscription
                    access, and security
                    settings from one place.
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.05] px-6 py-5 backdrop-blur-xl">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                    Account Status
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-[#22c55e]" />

                    <p className="text-lg font-black text-white">
                      Secure & Active
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN GRID */}
            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              {/* ACCOUNT CARD */}
              <article className="rounded-[30px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-[18px] bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)]">
                    <User2 className="h-6 w-6 text-white" />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                      Profile
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                      Account Details
                    </h2>
                  </div>
                </div>

                {/* EMAIL */}
                <div className="mt-8 rounded-[24px] border border-white/10 bg-[#0b1120] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                    Email Address
                  </p>

                  <p className="mt-3 break-all text-lg font-bold text-white">
                    {user.email}
                  </p>
                </div>

                {/* STRIPE */}
                <div className="mt-5 rounded-[24px] border border-white/10 bg-[#0b1120] p-5">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-[#818cf8]" />

                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                      Stripe Customer
                    </p>
                  </div>

                  <p className="mt-4 break-all text-sm font-medium text-[#cbd5e1]">
                    {customer?.stripe_customer_id ??
                      "Not linked yet"}
                  </p>
                </div>

                {/* SUBSCRIPTION */}
                <div className="mt-5 rounded-[24px] border border-white/10 bg-[#0b1120] p-5">
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

              {/* PASSWORD CARD */}
              <article className="rounded-[30px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-[18px] bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)]">
                    <LockKeyhole className="h-6 w-6 text-white" />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                      Security
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                      Password
                    </h2>
                  </div>
                </div>

                {/* SECURITY NOTICE */}
                <div className="mt-8 rounded-[24px] border border-[#22c55e]/15 bg-[#22c55e]/10 p-5">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-[#22c55e]" />

                    <p className="text-sm font-black text-[#86efac]">
                      Encryption Enabled
                    </p>
                  </div>

                  <p className="mt-3 text-sm leading-7 text-[#cbd5e1]">
                    Keep your account
                    secure by updating your
                    password regularly and
                    avoiding password reuse.
                  </p>
                </div>

                {/* FORM */}
                <div className="mt-6 rounded-[28px] border border-white/10 bg-[#0b1120] p-6">
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