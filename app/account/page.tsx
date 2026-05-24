import {
  CreditCard,
  LockKeyhole,
  ShieldCheck,
  User2,
} from "lucide-react";

import LogoutButton from "@/components/account/LogoutButton";
import PasswordUpdateForm from "@/components/account/PasswordUpdateForm";

import {
  fetchCustomerProfile,
} from "@/lib/account/customer-data";

import {
  requireCustomerUser,
} from "@/lib/auth/customer";

export default async function AccountSettingsPage() {
  const user =
    await requireCustomerUser();

  const customer =
    await fetchCustomerProfile(
      user.email ?? "",
    );

  return (
    <div className="grid gap-6">
      {/* HERO */}
      <header className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#1e1b4b_100%)] p-7 text-white shadow-[0_20px_80px_rgba(0,0,0,0.35)] sm:p-9">
        <div className="absolute right-[-10%] top-[-20%] h-[260px] w-[260px] rounded-full bg-[#6366f1]/20 blur-[90px]" />

        <div className="relative z-10">
          <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#c7d2fe]">
            Account Settings
          </p>

          <h1 className="text-[clamp(40px,5vw,72px)] font-black leading-none tracking-[-0.05em]">
            Settings
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-[#cbd5e1]">
            Manage your account,
            billing information,
            subscription access,
            and security settings.
          </p>
        </div>
      </header>

      {/* GRID */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* ACCOUNT */}
        <article className="rounded-[30px] border border-white/10 bg-[#0f172a]/80 p-7 text-white shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-[20px] bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] shadow-[0_12px_40px_rgba(99,102,241,0.35)]">
              <User2 className="h-6 w-6 text-white" />
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#94a3b8]">
                Profile
              </p>

              <h2 className="mt-1 text-3xl font-black">
                Account Details
              </h2>
            </div>
          </div>

          {/* EMAIL */}
          <div className="mt-8 rounded-[24px] border border-white/10 bg-[#020617] p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#94a3b8]">
              Email Address
            </p>

            <p className="mt-3 break-all text-lg font-black text-white">
              {user.email}
            </p>
          </div>

          {/* STRIPE */}
          <div className="mt-4 rounded-[24px] border border-white/10 bg-[#020617] p-5">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-[#818cf8]" />

              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#94a3b8]">
                Stripe Customer
              </p>
            </div>

            <p className="mt-3 break-all text-sm font-bold text-[#cbd5e1]">
              {customer?.stripe_customer_id ??
                "Not linked yet"}
            </p>
          </div>

          {/* SUBSCRIPTION */}
          <div className="mt-4 rounded-[24px] border border-white/10 bg-[#020617] p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#94a3b8]">
              Subscription
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="rounded-full border border-[#22c55e]/20 bg-[#22c55e]/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#86efac]">
                {customer?.subscription_status ??
                  "inactive"}
              </div>

              <div className="rounded-full border border-[#6366f1]/20 bg-[#6366f1]/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#c7d2fe]">
                {customer?.plan_tier ??
                  "none"}
              </div>
            </div>
          </div>

          {/* STATUS */}
          <div className="mt-4 rounded-[24px] border border-white/10 bg-[#020617] p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#22c55e]" />

              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#94a3b8]">
                  Account Status
                </p>

                <p className="mt-1 text-sm font-bold text-[#86efac]">
                  Secure & Active
                </p>
              </div>
            </div>
          </div>

          {/* LOGOUT */}
          <div className="mt-8">
            <LogoutButton />
          </div>
        </article>

        {/* PASSWORD */}
        <article className="rounded-[30px] border border-white/10 bg-[#0f172a]/80 p-7 text-white shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-[20px] bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] shadow-[0_12px_40px_rgba(99,102,241,0.35)]">
              <LockKeyhole className="h-6 w-6 text-white" />
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#94a3b8]">
                Security
              </p>

              <h2 className="mt-1 text-3xl font-black">
                Password
              </h2>
            </div>
          </div>

          {/* SECURITY */}
          <div className="mt-8 rounded-[24px] border border-[#22c55e]/15 bg-[#052e16]/60 p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#22c55e]" />

              <p className="text-sm font-extrabold text-[#86efac]">
                Password Encryption Enabled
              </p>
            </div>

            <p className="mt-3 text-sm leading-7 text-[#cbd5e1]">
              Keep your account secure
              by updating your password
              regularly and avoiding
              password reuse.
            </p>
          </div>

          {/* FORM */}
          <div className="mt-6 rounded-[24px] border border-white/10 bg-[#020617] p-6">
            <PasswordUpdateForm />
          </div>
        </article>
      </div>
    </div>
  );
}