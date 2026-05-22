"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const portalLinks = [
  { href: "/dashboard", label: "Overview", token: "OV" },
  { href: "/qr-dashboard", label: "QR Manager", token: "QR" },
  { href: "/design-generator", label: "Design Tools", token: "AI" },
  { href: "/background-remover", label: "Background Remover", token: "BG" },
  { href: "/my-designs", label: "Saved Designs", token: "DS" },
  { href: "/account/settings", label: "Account Details", token: "AC" },
  { href: "/products", label: "Print Products", token: "PR" },
];

export default function PortalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-fit rounded-[30px] border border-white/70 bg-white p-5 shadow-[0_12px_38px_rgba(0,0,0,0.06)] lg:sticky lg:top-5 lg:w-[290px]">
      <div className="rounded-[24px] bg-[#111827] p-5 text-white">
        <h2 className="text-[34px] font-black leading-none tracking-normal">PRNTD</h2>
        <p className="mt-2 text-sm font-semibold text-white/65">Customer Portal</p>
      </div>

      <nav className="mt-4 grid gap-2">
        {portalLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-[18px] px-3 py-3 text-sm font-extrabold text-[#1f2937] no-underline transition hover:bg-[#eef2ff] hover:text-[#4338ca] ${
                isActive ? "bg-[#eef2ff] text-[#4338ca]" : ""
              }`}
            >
              <span
                className={`grid h-9 w-9 place-items-center rounded-[13px] text-xs font-black ${
                  isActive
                    ? "bg-[linear-gradient(135deg,#3b82f6,#6366f1,#7c3aed)] text-white"
                    : "bg-[#f5f7fb] text-[#6b7280]"
                }`}
              >
                {link.token}
              </span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
