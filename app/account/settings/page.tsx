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
      {/* HEADER */}
      <header className="rounded-[30px] bg-[#111827] p-6 text-white shadow-[0_18px_50px_rgba(17,24,39,0.18)] sm:p-8">
        <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-white/70">
          Account Settings
        </p>

        <h1 className="text-[clamp(34px,4.2vw,62px)] font-black leading-none">
          Manage Your Account
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
          Update your account
          information, billing
          details, subscription
          access, and password
          security settings.
        </p>
      </header>

      {/* GRID */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* ACCOUNT */}
        <article className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_10px_28px_rgba(0,0,0,0.045)]">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-[20px] bg-[#eef2ff]">
              <User2 className="h-6 w-6 text-[#4f46e5]" />
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">
                Profile
              </p>

              <h2 className="mt-1 text-3xl font-black text-[#111827]">
                Account Details
              </h2>
            </div>
          </div>

          {/* EMAIL */}
          <div className="mt-8 rounded-[22px] bg-[#f5f7fb] p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">
              Email Address
            </p>

            <p className="mt-3 break-all text-lg font-black text-[#111827]">
              {user.email}
            </p>
          </div>

          {/* STRIPE */}
          <div className="mt-4 rounded-[22px] bg-[#f5f7fb] p-5">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-[#4f46e5]" />

              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">
                Stripe Customer
              </p>
            </div>

            <p className="mt-3 break-all text-sm font-bold text-[#111827]">
              {customer?.stripe_customer_id ??
                "Not linked yet"}
            </p>
          </div>

          {/* SUBSCRIPTION */}
          <div className="mt-4 rounded-[22px] bg-[#f5f7fb] p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">
              Subscription
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="rounded-full bg-[#dcfce7] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#166534]">
                {customer?.subscription_status ??
                  "inactive"}
              </div>

              <div className="rounded-full bg-[#e0e7ff] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#3730a3]">
                {customer?.plan_tier ??
                  "none"}
              </div>
            </div>
          </div>

          {/* STATUS */}
          <div className="mt-4 rounded-[22px] bg-[#f5f7fb] p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#16a34a]" />

              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">
                  Account Status
                </p>

                <p className="mt-1 text-sm font-bold text-[#166534]">
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
        <article className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_10px_28px_rgba(0,0,0,0.045)]">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-[20px] bg-[#eef2ff]">
              <LockKeyhole className="h-6 w-6 text-[#4f46e5]" />
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">
                Security
              </p>

              <h2 className="mt-1 text-3xl font-black text-[#111827]">
                Password
              </h2>
            </div>
          </div>

          {/* SECURITY */}
          <div className="mt-8 rounded-[22px] border border-[#dcfce7] bg-[#f0fdf4] p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#16a34a]" />

              <p className="text-sm font-extrabold text-[#166534]">
                Password Encryption Enabled
              </p>
            </div>

            <p className="mt-3 text-sm leading-7 text-[#4b5563]">
              Keep your account secure
              by updating your password
              regularly and avoiding
              password reuse.
            </p>
          </div>

          {/* FORM */}
          <div className="mt-6 rounded-[24px] bg-[#f5f7fb] p-6">
            <PasswordUpdateForm />
          </div>
        </article>
      </div>
    </div>
  );
}