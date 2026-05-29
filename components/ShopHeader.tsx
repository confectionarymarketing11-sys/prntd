"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  Menu,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/features/site-settings/types";

const navItems = [
  {
    href: "/dashboard",
    label: "Customer Portal",
  },
  {
    href: "/products/classic-tee",
    label: "Custom T-Shirts",
  },
  {
    href: "/products/business-cards",
    label: "Business Cards",
  },
  {
    href: "/products/die-cut-stickers",
    label: "Custom Stickers",
  },

{
    href: "/blog",
    label: "Blog",
  },
  {
    href: "/contact",
    label: "Contact",
  },


];

export default function ShopHeader() {
  const [user, setUser] =
    useState<User | null>(null);

  const [settings, setSettings] =
    useState<SiteSettings | null>(null);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  useEffect(() => {
    let isMounted = true;

    try {
      const supabase =
        createSupabaseBrowserClient();

      supabase.auth
        .getUser()
        .then(({ data }) => {
          if (isMounted)
            setUser(data.user);
        });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (isMounted)
            setUser(session?.user ?? null);
        },
      );

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

  useEffect(() => {
    let active = true;

    fetch("/api/site-settings")
      .then((response) =>
        response.json(),
      )
      .then((data: SiteSettings) => {
        if (!active) return;
        setSettings(data);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/80 backdrop-blur-2xl">
        {/* TOP BAR */}
        {settings?.announcement_enabled &&
        settings.announcement_text ? (
          <div className="border-b border-white/10 bg-[linear-gradient(135deg,#312e81_0%,#1d4ed8_100%)] px-4 py-2 text-center text-sm font-black text-white">
            {settings.announcement_link ? (
              <Link
                href={
                  settings.announcement_link
                }
                className="text-white no-underline hover:opacity-80"
              >
                {
                  settings.announcement_text
                }
              </Link>
            ) : (
              settings.announcement_text
            )}
          </div>
        ) : null}

        {/* TEST MODE */}
        {settings?.test_mode_enabled ? (
          <div className="bg-amber-400 px-4 py-2 text-center text-sm font-black text-amber-950">
            {
              settings.test_mode_notice
            }
          </div>
        ) : null}

        {/* MAIN NAV */}
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-5 sm:py-4">
          {/* LOGO */}
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-3 no-underline sm:gap-4"
          >
            {settings?.logo_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={
                  settings.logo_image_url
                }
                alt={
                  settings.logo_text ||
                  "PRNTD"
                }
              className="h-11 w-11 shrink-0 rounded-2xl border border-white/10 object-cover shadow-[0_12px_40px_rgba(0,0,0,0.35)] sm:h-12 sm:w-12"
              />
            ) : (
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] text-sm font-black tracking-tight text-white shadow-[0_12px_40px_rgba(99,102,241,0.45)] sm:h-12 sm:w-12">
                {(
                  settings?.logo_text ||
                  "PRNTD"
                )
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <span className="block truncate text-[18px] font-black tracking-[-0.03em] text-white sm:text-[22px]">
                {settings?.logo_text ||
                  "PRNTD"}
              </span>

              <span className="block max-w-[120px] truncate text-[10px] font-bold uppercase tracking-[0.16em] text-[#94a3b8] sm:max-w-none sm:text-[11px] sm:tracking-[0.22em]">
                {settings?.logo_subtitle ||
                  "Premium Print Shop"}
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-2 xl:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-bold text-[#e2e8f0] no-underline transition duration-300 hover:border-[#6366f1]/40 hover:bg-white/[0.08] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/search"
              aria-label="Search"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-white transition hover:border-[#6366f1]/40 hover:bg-white/[0.08] sm:h-11 sm:w-11"
            >
              <Search className="h-4 w-4" />
            </Link>

            <Link
              href={
                user
                  ? "/dashboard"
                  : "/login"
              }
              aria-label={
                user
                  ? "Customer account"
                  : "Login"
              }
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-white transition hover:border-[#6366f1]/40 hover:bg-white/[0.08] sm:h-11 sm:w-11"
            >
              <UserRound className="h-4 w-4" />
            </Link>

            <Link
              href="/cart"
              aria-label="Cart"
              className="grid h-10 w-10 place-items-center rounded-full bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] text-white shadow-[0_12px_40px_rgba(99,102,241,0.45)] transition hover:scale-105 sm:h-11 sm:w-11"
            >
              <ShoppingCart className="h-4 w-4" />
            </Link>

            {/* MOBILE TOGGLE */}
            <button
              type="button"
              onClick={() =>
                setMobileOpen(
                  !mobileOpen,
                )
              }
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-white transition hover:bg-white/[0.08] sm:h-11 sm:w-11 xl:hidden"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE NAV */}
        {mobileOpen ? (
          <div className="border-t border-white/10 bg-[#020617]/95 px-5 py-5 xl:hidden">
            <nav className="grid gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-bold text-[#e2e8f0] no-underline transition hover:border-[#6366f1]/40 hover:bg-white/[0.08] hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        ) : null}
      </header>
    </>
  );
}
