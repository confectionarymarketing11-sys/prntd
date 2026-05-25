"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CreditCard,
  Image,
  LayoutDashboard,
  Package2,
  QrCode,
  Settings,
  Sparkles,
  Wand2,
} from "lucide-react";

const portalLinks = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/qr-dashboard",
    label: "QR Manager",
    icon: QrCode,
  },
  {
    href: "/design-tools",
    label: "Design Tools",
    icon: Sparkles,
  },
  {
    href: "/background-remover",
    label: "Background Remover",
    icon: Wand2,
  },
  {
    href: "/my-designs",
    label: "Saved Designs",
    icon: Image,
  },
  {
    href: "/subscriptions",
    label: "Subscriptions",
    icon: CreditCard,
  },
  {
    href: "/account/settings",
    label: "Account Details",
    icon: Settings,
  },
  {
    href: "/products",
    label: "Print Products",
    icon: Package2,
  },
];

export default function PortalSidebar() {
  const pathname =
    usePathname();

  return (
    <aside className="h-fit overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.45)] lg:sticky lg:top-5 lg:w-[320px]">
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#312e81_100%)] p-6">
        <div className="absolute right-[-15%] top-[-15%] h-[180px] w-[180px] rounded-full bg-[#8b5cf6]/20 blur-[80px]" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c7d2fe]">
            <Sparkles className="h-3.5 w-3.5" />
            Premium Portal
          </div>

          <h2 className="mt-6 text-[42px] font-black leading-none tracking-[-0.05em] text-white">
            PRNTD
          </h2>

          <p className="mt-3 text-sm font-semibold leading-7 text-white/65">
            Creator workspace with
            modern design tools, QR management,
            subscriptions, saved
            designs, and premium
            print products.
          </p>
        </div>
      </div>

      {/* NAV */}
      <nav className="mt-5 grid gap-2.5">
        {portalLinks.map(
          (link) => {
            const isActive =
              pathname ===
              link.href;

            const Icon =
              link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex items-center gap-4 overflow-hidden rounded-[22px] border px-4 py-4 text-sm font-black no-underline transition duration-300 ${
                  isActive
                    ? "border-[#6366f1]/30 bg-[linear-gradient(135deg,rgba(59,130,246,0.18),rgba(99,102,241,0.16),rgba(139,92,246,0.16))] text-white shadow-[0_15px_40px_rgba(99,102,241,0.18)]"
                    : "border-transparent bg-white/[0.03] text-[#cbd5e1] hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-[16px] transition ${
                    isActive
                      ? "bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] text-white shadow-[0_12px_30px_rgba(99,102,241,0.35)]"
                      : "bg-[#0f172a] text-[#94a3b8] group-hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate">
                    {link.label}
                  </p>

                  <p
                    className={`mt-1 text-[11px] font-bold uppercase tracking-[0.12em] ${
                      isActive
                        ? "text-[#c7d2fe]"
                        : "text-[#64748b]"
                    }`}
                  >
                    Portal Section
                  </p>
                </div>
              </Link>
            );
          },
        )}
      </nav>

      {/* FOOTER */}
      <div className="mt-5 rounded-[28px] border border-white/10 bg-[#0f172a]/80 p-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94a3b8]">
          Premium Access
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "Design Tools",
            "Stripe",
            "Analytics",
            "Cloud Saved",
          ].map((item) => (
            <div
              key={item}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-black text-[#cbd5e1]"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}