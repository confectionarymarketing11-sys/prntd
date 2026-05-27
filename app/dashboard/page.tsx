"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Brush,
  CreditCard,
  Globe,
  QrCode,
  ShoppingBag,
  Sparkles,
  Zap,
} from "lucide-react";

import PortalSidebar from "@/components/PortalSidebar";
import ShopHeader from "@/components/ShopHeader";
import { usePrntdAccount } from "@/hooks/usePrntdAccount";
import {
  fetchCredits,
  fetchDesigns,
  fetchQrAnalytics,
  fetchQrLinks,
  fetchSubscription,
  QrAnalytics,
  SubscriptionResponse,
} from "@/lib/prntdClient";

export default function DashboardPage() {
  const {
    email,
    token,
    status: accountStatus,
    loadAccount,
  } = usePrntdAccount();

  const [status, setStatus] = useState("");
  const [credits, setCredits] = useState("--");
  const [subscription, setSubscription] =
    useState<SubscriptionResponse | null>(
      null,
    );

  const [qrCount, setQrCount] =
    useState("--");

  const [designCount, setDesignCount] =
    useState("--");

  const [analytics, setAnalytics] =
    useState<QrAnalytics | null>(null);

  const [lastSynced, setLastSynced] =
    useState("");

  const refreshDashboard =
    useCallback(async () => {
      const session =
        token && email
          ? { email, token }
          : await loadAccount();

      if (
        !session?.email ||
        !session.token
      ) {
        setStatus(
          "Sign in to load portal data.",
        );

        return;
      }

      setStatus("Loading portal data...");

      try {
        const [
          creditData,
          subscriptionData,
          qrData,
          analyticsData,
          designData,
        ] = await Promise.all([
          fetchCredits(session.token),

          fetchSubscription(
            session.email,
            session.token,
          ),

          fetchQrLinks(
            session.email,
            session.token,
          ),

          fetchQrAnalytics(
            session.email,
            session.token,
          ),

          fetchDesigns(session.token),
        ]);

        setCredits(
          String(
            creditData.total_credits ??
              "--",
          ),
        );

        setSubscription(subscriptionData);

        setQrCount(
          Array.isArray(qrData)
            ? String(qrData.length)
            : "0",
        );

        setAnalytics(analyticsData);

        setDesignCount(
          String(
            designData.designs?.length ??
              0,
          ),
        );

        setLastSynced(
          new Intl.DateTimeFormat(
            undefined,
            {
              hour: "numeric",
              minute: "2-digit",
            },
          ).format(new Date()),
        );

        setStatus("Portal synced.");
      } catch (error) {
        setStatus(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard.",
        );
      }
    }, [email, token, loadAccount]);

  useEffect(() => {
    if (!email || !token) return;

    const timer = window.setTimeout(() => {
      void refreshDashboard();
    }, 0);

    return () =>
      window.clearTimeout(timer);
  }, [email, token, refreshDashboard]);

  const stats = [
    {
      title: "Credits",
      value: `${credits}`,
      detail: "Available design credits",
      accent:
        "from-[#3b82f6] to-[#6366f1]",
    },

    {
      title: "Saved Designs",
      value: designCount,
      detail: "Stored assets",
      accent:
        "from-[#8b5cf6] to-[#ec4899]",
    },

    {
      title: "QR Campaigns",
      value: qrCount,
      detail: "Live smart redirects",
      accent:
        "from-[#06b6d4] to-[#3b82f6]",
    },

    {
      title: "Monthly Scans",
      value: String(
        analytics?.monthlyScansTotal ??
          0,
      ),
      detail: "QR traffic",
      accent:
        "from-[#14b8a6] to-[#06b6d4]",
    },
  ];

  const actions = [
    {
      title: "Create Designs",
      detail:
        "Generate premium graphics and print-ready artwork.",
      href: "/design-generator",
      icon: Brush,
      glow:
        "from-[#8b5cf6] to-[#ec4899]",
    },

    {
      title: "QR Manager",
      detail:
        "Track scans and update smart redirects.",
      href: "/qr-dashboard",
      icon: QrCode,
      glow:
        "from-[#06b6d4] to-[#3b82f6]",
    },

    {
      title: "Shop Products",
      detail:
        "Launch apparel, stickers, and cards.",
      href: "/products",
      icon: ShoppingBag,
      glow:
        "from-[#3b82f6] to-[#6366f1]",
    },

    {
      title: "Saved Assets",
      detail:
        "Reuse and download generated assets.",
      href: "/my-designs",
      icon: Sparkles,
      glow:
        "from-[#6366f1] to-[#8b5cf6]",
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[#4f46e5]/20 blur-[140px]" />

        <div className="absolute bottom-[-15%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[#2563eb]/20 blur-[160px]" />
      </div>

      <div className="relative z-10">
        <ShopHeader />

        <div className="mx-auto flex max-w-[1600px] gap-6 px-5 py-8 max-[980px]:flex-col">
          <PortalSidebar />

          <section className="min-w-0 flex-1">
            {/* HERO */}
            <div className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#312e81_100%)] p-8 shadow-[0_35px_120px_rgba(0,0,0,0.45)] sm:p-10">
              <div className="absolute right-[-5%] top-[-5%] h-[340px] w-[340px] rounded-full bg-[#8b5cf6]/20 blur-[120px]" />

              <div className="relative grid gap-8 xl:grid-cols-[1fr_340px]">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#c7d2fe] backdrop-blur">
                    <Zap className="h-3.5 w-3.5" />
                    PRNTD Workspace
                  </div>

                  <h1 className="mt-7 text-[clamp(52px,7vw,92px)] font-black leading-[0.92] tracking-[-0.06em]">
                    Welcome back
                    <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                      {email
                        ? email.split("@")[0]
                        : "Creator"}
                    </span>
                  </h1>

                  <p className="mt-6 max-w-2xl text-lg leading-9 text-[#cbd5e1]">
                    Manage print assets,
                    online design tools, QR campaigns,
                    ecommerce workflows,
                    and customer projects
                    from one premium
                    workspace.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                      href="/products"
                      className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] px-7 py-4 text-sm font-black text-white no-underline shadow-[0_15px_50px_rgba(99,102,241,0.45)] transition hover:-translate-y-1"
                    >
                      Shop Products
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        void refreshDashboard()
                      }
                      className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-7 py-4 text-sm font-black text-white transition hover:bg-white/[0.08]"
                    >
                      Refresh Portal
                    </button>

<button
  type="button"
  onClick={() => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/signin";
  }}
  className="inline-flex items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 px-7 py-4 text-sm font-black text-red-200 transition hover:bg-red-500/20"
>
  Sign Out
</button>
                  </div>
                </div>

                {/* ACCOUNT PANEL */}
                <div className="rounded-[30px] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                        Account Status
                      </p>

                      <p className="mt-3 text-2xl font-black">
                        {subscription?.subscription_active
                          ? "Active"
                          : "Starter"}
                      </p>
                    </div>

                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] shadow-[0_15px_50px_rgba(99,102,241,0.45)]">
                      <CreditCard className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4">
                    <div className="rounded-2xl border border-white/10 bg-[#0f172a]/80 p-5">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                        Available Credits
                      </p>

                      <p className="mt-3 text-5xl font-black">
                        {credits}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#0f172a]/80 p-5">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                        Last Sync
                      </p>

                      <p className="mt-3 text-lg font-black">
                        {lastSynced ||
                          "Waiting"}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[#94a3b8]">
                        {status ||
                          accountStatus}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STATS */}
            <div className="mt-6 grid grid-cols-4 gap-4 max-[1200px]:grid-cols-2 max-[640px]:grid-cols-1">
              {stats.map((stat) => (
                <article
                  key={stat.title}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#6366f1]/30"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.accent} opacity-[0.08]`}
                  />

                  <div className="relative">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                      {stat.title}
                    </p>

                    <p className="mt-5 text-[44px] font-black leading-none">
                      {stat.value}
                    </p>

                    <p className="mt-4 text-sm text-[#cbd5e1]">
                      {stat.detail}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="mt-6 grid grid-cols-2 gap-5 max-[900px]:grid-cols-1">
              {actions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#6366f1]/30 hover:shadow-[0_25px_70px_rgba(99,102,241,0.18)]"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${action.glow} opacity-[0.08]`}
                    />

                    <div className="relative">
                      <div className="flex items-start justify-between">
                        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] shadow-[0_15px_50px_rgba(99,102,241,0.35)]">
                          <Icon className="h-7 w-7 text-white" />
                        </div>

                        <ArrowUpRight className="h-6 w-6 text-[#94a3b8] transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-white" />
                      </div>

                      <h2 className="mt-7 text-3xl font-black tracking-[-0.03em]">
                        {action.title}
                      </h2>

                      <p className="mt-4 max-w-xl text-[15px] leading-8 text-[#cbd5e1]">
                        {action.detail}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* LOWER PANELS */}
            <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <article className="rounded-[32px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[linear-gradient(135deg,#06b6d4,#3b82f6)]">
                    <BarChart3 className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                      Portal Analytics
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                      Workspace Health
                    </h2>
                  </div>
                </div>

                <p className="mt-6 max-w-3xl text-[15px] leading-8 text-[#cbd5e1]">
                  Monitor QR performance,
                  design usage, account
                  status, and smart
                  campaign activity from
                  one centralized portal.
                </p>

                <div className="mt-8">
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)]"
                      style={{
                        width:
                          subscription?.max_qr_limit
                            ? `${Math.min(
                                ((subscription.active_qr_count ??
                                  0) /
                                  subscription.max_qr_limit) *
                                  100,
                                100,
                              )}%`
                            : "0%",
                      }}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-[#94a3b8]">
                      QR Usage
                    </span>

                    <span className="font-black">
                      {
                        subscription?.active_qr_count
                      }
                      /
                      {
                        subscription?.max_qr_limit
                      }
                    </span>
                  </div>
                </div>
              </article>

              <article className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,#111827_0%,#1e1b4b_100%)] p-7 shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[linear-gradient(135deg,#8b5cf6,#ec4899)] shadow-[0_20px_60px_rgba(139,92,246,0.35)]">
                  <Globe className="h-7 w-7 text-white" />
                </div>

                <h2 className="mt-7 text-[40px] font-black leading-[1] tracking-[-0.04em]">
                  Ready To
                  <span className="block text-[#a5b4fc]">
                    Launch?
                  </span>
                </h2>

                <p className="mt-5 text-[15px] leading-8 text-[#cbd5e1]">
                  Create products, attach
                  saved assets, and launch
                  premium branded
                  experiences directly from
                  your workspace.
                </p>

                <Link
                  href="/products"
                  className="mt-8 inline-flex items-center justify-center rounded-2xl bg-white px-7 py-4 text-sm font-black text-[#111827] no-underline transition hover:scale-[1.02]"
                >
                  Open Product Catalog
                </Link>
              </article>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}