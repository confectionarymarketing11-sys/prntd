"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const accountLinks = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/designs", label: "Designs" },
  { href: "/account/settings", label: "Settings" },
];

export default function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-2">
      {accountLinks.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-[18px] px-4 py-3 text-sm font-extrabold no-underline transition ${
              isActive ? "bg-[#eef2ff] text-[#4338ca]" : "text-[#374151] hover:bg-[#f5f7fb]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
