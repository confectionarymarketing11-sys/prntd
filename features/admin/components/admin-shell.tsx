import Link from "next/link";
import { ClipboardList, Factory, Images, LogOut, PackageCheck, Truck } from "lucide-react";
import { signOutAdmin } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import type { CurrentAdmin } from "@/features/admin/data/auth";

const navItems = [
  { href: "/admin", label: "Orders", icon: ClipboardList },
  { href: "/admin?status=printing", label: "Printing", icon: Factory },
  { href: "/admin?status=packing", label: "Packing", icon: PackageCheck },
  { href: "/admin?status=shipped", label: "Shipping", icon: Truck },
  { href: "/admin?status=approved", label: "Artwork", icon: Images },
];

export default function AdminShell({ admin, children }: { admin: CurrentAdmin; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-r border-slate-200 bg-white px-4 py-5 lg:sticky lg:top-0 lg:h-screen">
          <Link href="/admin" className="flex items-center gap-3 rounded-xl bg-slate-950 p-4 text-white no-underline">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-sm font-black text-slate-950">PR</span>
            <span>
              <span className="block text-lg font-black leading-none">PRNTD</span>
              <span className="text-xs font-semibold text-white/60">Fulfillment Ops</span>
            </span>
          </Link>

          <nav className="mt-5 grid gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 no-underline transition hover:bg-slate-100 hover:text-slate-950"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Signed In</p>
            <p className="mt-2 truncate text-sm font-bold">{admin.email}</p>
            <p className="mt-1 text-xs text-slate-500">{admin.profile.role}</p>
            <form action={signOutAdmin} className="mt-4">
              <Button type="submit" variant="outline" size="sm" className="w-full">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </div>
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}
