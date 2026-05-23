"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/features/site-settings/types";

const navItems = [
  { href: "/search", label: "Search" },
  { href: "/products", label: "Products" },
  { href: "/design-tools", label: "Design Tools" },
  { href: "/contact", label: "Contact" },
  { href: "/dashboard", label: "Customer Portal" },
  { href: "/cart", label: "Cart" },
];

export default function ShopHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [currency, setCurrency] = useState("CAD");
  const [language, setLanguage] = useState("en");

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

  useEffect(() => {
    let active = true;

    fetch("/api/site-settings")
      .then((response) => response.json())
      .then((data: SiteSettings) => {
        if (!active) return;
        setSettings(data);
        setCurrency(window.localStorage.getItem("prntd_currency") || data.default_currency || "CAD");
        setLanguage(window.localStorage.getItem("prntd_language") || data.supported_languages?.[0] || "en");
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }

  return (
    <header className="border-b border-stone-200 bg-white/95">
      {settings?.announcement_enabled && settings.announcement_text ? (
        <div className="bg-slate-950 px-4 py-2 text-center text-sm font-bold text-white">
          {settings.announcement_link ? (
            <Link href={settings.announcement_link} className="text-white no-underline hover:underline">
              {settings.announcement_text}
            </Link>
          ) : (
            settings.announcement_text
          )}
        </div>
      ) : null}
      {settings?.test_mode_enabled ? (
        <div className="bg-amber-400 px-4 py-2 text-center text-sm font-black text-amber-950">
          {settings.test_mode_notice}
        </div>
      ) : null}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          {settings?.logo_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logo_image_url} alt={settings.logo_text || "PRNTD"} className="h-10 w-10 rounded object-contain" />
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded bg-black text-sm font-black tracking-tight text-white">
              {(settings?.logo_text || "PRNTD").slice(0, 2).toUpperCase()}
            </span>
          )}
          <span>
            <span className="block text-lg font-black tracking-tight text-stone-950">{settings?.logo_text || "PRNTD"}</span>
            <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
              {settings?.logo_subtitle || "Custom print shop"}
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
          <select
            value={currency}
            onChange={(event) => {
              setCurrency(event.target.value);
              window.localStorage.setItem("prntd_currency", event.target.value);
            }}
            className="rounded border border-stone-200 bg-white px-2 py-2 text-sm font-semibold text-stone-700"
            aria-label="Currency"
          >
            {(settings?.supported_currencies?.length ? settings.supported_currencies : ["CAD", "USD"]).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={language}
            onChange={(event) => {
              setLanguage(event.target.value);
              window.localStorage.setItem("prntd_language", event.target.value);
            }}
            className="rounded border border-stone-200 bg-white px-2 py-2 text-sm font-semibold text-stone-700"
            aria-label="Language"
          >
            {(settings?.supported_languages?.length ? settings.supported_languages : ["en", "fr"]).map((item) => (
              <option key={item} value={item}>
                {item.toUpperCase()}
              </option>
            ))}
          </select>
        </nav>
      </div>
    </header>
  );
}
