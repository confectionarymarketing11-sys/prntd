import LogoutButton from "@/components/account/LogoutButton";
import PasswordUpdateForm from "@/components/account/PasswordUpdateForm";
import { requireCustomerUser } from "@/lib/auth/customer";

export default async function AccountSettingsPage() {
  const user = await requireCustomerUser();

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-[clamp(34px,4.2vw,56px)] font-black leading-none tracking-normal">Settings</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#6b7280]">Manage your customer login and password.</p>
      </header>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_10px_28px_rgba(0,0,0,0.045)]">
          <h2 className="text-2xl font-black">Account</h2>
          <p className="mt-3 text-sm leading-6 text-[#6b7280]">Email</p>
          <p className="mt-1 break-all text-lg font-black">{user.email}</p>
          <div className="mt-5">
            <LogoutButton />
          </div>
        </article>

        <article className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_10px_28px_rgba(0,0,0,0.045)]">
          <h2 className="mb-5 text-2xl font-black">Password</h2>
          <PasswordUpdateForm />
        </article>
      </section>
    </div>
  );
}
