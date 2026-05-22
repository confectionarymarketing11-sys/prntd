"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/", label: "Storefront" },
  { href: "/products", label: "Products" },
  { href: "/design-generator", label: "Design Creator" },
  { href: "/designer", label: "Designer" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/dashboard", label: "Customer Portal" },
  { href: "/cart", label: "Cart" },
];

export default function ShopHeader() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;

    try {
      const supabase = createSupabaseBrowserClient();

      supabase.auth.getUser().then(({ data }) => {
        if (isMounted) setUser(data.user);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (isMounted) setUser(session?.user ?? null);
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } catch {
      return () => {
        isMounted = false;
      };
    }
  }, []);

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }

  return (
    <header className="border-b border-stone-200 bg-white/95">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded bg-black text-sm font-black tracking-tight text-white">
            PR
          </span>
          <span>
            <span className="block text-lg font-black tracking-tight text-stone-950">PRNTD</span>
            <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Custom print shop
            </span>
          </span>
        </Link>
        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-950 hover:text-stone-950"
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <button
              type="button"
              onClick={logout}
              className="rounded border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-950 hover:text-stone-950"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-950 hover:text-stone-950"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded bg-stone-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
