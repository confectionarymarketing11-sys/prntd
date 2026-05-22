import type { ReactNode } from "react";
import AccountNav from "@/components/account/AccountNav";
import ShopHeader from "@/components/ShopHeader";

type AccountShellProps = {
  children: ReactNode;
  email: string;
};

export default function AccountShell({ children, email }: AccountShellProps) {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <ShopHeader />
      <div className="mx-auto grid max-w-[1400px] gap-6 px-5 py-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-[30px] border border-white/70 bg-white p-5 shadow-[0_12px_38px_rgba(0,0,0,0.06)] lg:sticky lg:top-5">
          <div className="mb-4 rounded-[24px] bg-[#111827] p-5 text-white">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/55">Signed in as</p>
            <p className="mt-2 break-all text-sm font-bold text-white/82">{email}</p>
          </div>
          <AccountNav />
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}
