"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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
  const { email, token, status: accountStatus, loadAccount } = usePrntdAccount();
  const [status, setStatus] = useState("");
  const [credits, setCredits] = useState("--");
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [qrCount, setQrCount] = useState("--");
  const [designCount, setDesignCount] = useState("--");
  const [analytics, setAnalytics] = useState<QrAnalytics | null>(null);
  const [lastSynced, setLastSynced] = useState("");

  const refreshDashboard = useCallback(async () => {
    const session = token && email ? { email, token } : await loadAccount();

    if (!session?.email || !session.token) {
      setStatus("Sign in to load portal data.");
      return;
    }

    setStatus("Loading portal data...");

    try {
      const [creditData, subscriptionData, qrData, analyticsData, designData] = await Promise.all([
        fetchCredits(session.token),
        fetchSubscription(session.email),
        fetchQrLinks(session.email),
        fetchQrAnalytics(session.email),
        fetchDesigns(session.token),
      ]);

      setCredits(String(creditData.total_credits ?? "--"));
      setSubscription(subscriptionData);
      setQrCount(Array.isArray(qrData) ? String(qrData.length) : "0");
      setAnalytics(analyticsData);
      setDesignCount(String(designData.designs?.length ?? 0));
      setLastSynced(new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date()));
      setStatus("Portal data loaded.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to load portal data.");
    }
  }, [email, token, loadAccount]);

  useEffect(() => {
    if (!email || !token) return;
    const timer = window.setTimeout(() => {
      void refreshDashboard();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [email, token, refreshDashboard]);

  const stats = [
    {
      title: "Subscription",
      value: subscription?.subscription_active ? `${subscription.plan_type ?? "Active"} Plan` : "No Active Plan",
      detail: subscription?.payment_status ?? "Status unavailable",
    },
    {
      title: "Credits",
      value: `${credits} Credits`,
      detail: "Design and image tools",
    },
    {
      title: "Active QR Codes",
      value: qrCount,
      detail: `${subscription?.remaining_slots ?? 0} slots remaining`,
    },
    {
      title: "Saved Designs",
      value: designCount,
      detail: "Generated brand assets",
    },
    {
      title: "Monthly Scans",
      value: String(analytics?.monthlyScansTotal ?? 0),
      detail: "Smart QR traffic",
    },
    {
      title: "Top Country",
      value: analytics?.topCountry ?? "-",
      detail: "QR audience",
    },
    {
      title: "Top Device",
      value: analytics?.topDevice ?? "-",
      detail: "Scan device type",
    },
    {
      title: "URL Health",
      value: analytics?.urlHealth ?? "-",
      detail: "Latest redirect check",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <ShopHeader />
      <div className="mx-auto flex max-w-[1440px] gap-6 px-5 py-8 max-[900px]:flex-col">
        <PortalSidebar />

        <section className="min-w-0 flex-1">
          <div className="relative mb-5 overflow-hidden rounded-[30px] bg-[#111827] p-6 text-white shadow-[0_18px_50px_rgba(17,24,39,0.18)] sm:p-8">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,.55),transparent_45%),radial-gradient(circle_at_bottom,rgba(59,130,246,.38),transparent_44%)]" />
            <div className="relative grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
              <div>
                <div className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-white/80">
                  PRNTD Customer Portal
                </div>
                <h1 className="max-w-[740px] text-[clamp(34px,4.2vw,62px)] font-black leading-[1.02] tracking-normal">
                  Welcome back{email ? `, ${email.split("@")[0]}` : ""}
                </h1>
                <p className="mt-4 max-w-[680px] text-[16px] leading-7 text-white/72">
                  Manage credits, saved designs, QR campaigns, and print-ready assets from one clean workspace.
                </p>
              </div>
              <div className="grid gap-3 rounded-[24px] border border-white/12 bg-white/10 p-5 backdrop-blur">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/55">Available Credits</p>
                  <p className="mt-1 text-[42px] font-black leading-none">{credits}</p>
                </div>
                <p className="text-sm leading-6 text-white/70">
                  {lastSynced ? `Synced at ${lastSynced}` : "Sign in to sync live account data."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/70 bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.045)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">Customer Account</p>
                <p className="mt-2 text-lg font-black">{email || "Loading..."}</p>
                <p className="mt-1 text-sm text-[#6b7280]">{status || accountStatus}</p>
              </div>
              <button type="button" onClick={() => void refreshDashboard()} className="portal-action">
                Refresh Portal
              </button>
            </div>
          </div>

          <div className="my-6 grid grid-cols-3 gap-3 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
            {[
              ["Create New Design", "Generate artwork for print products.", "/design-generator"],
              ["Remove Background", "Clean product and apparel images.", "/background-remover"],
              ["Saved Designs", "Reuse or download generated assets.", "/my-designs"],
              ["Manage QR Codes", "Update redirects and track scans.", "/qr-dashboard"],
              ["Shop Print Products", "Apply designs to stickers and apparel.", "/products"],
              ["Open Cart", "Review quantities and checkout.", "/cart"],
            ].map(([title, detail, href]) => (
              <Link key={href} href={href} className="group rounded-[22px] border border-white/70 bg-white p-5 text-[#111827] shadow-[0_10px_30px_rgba(0,0,0,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(99,102,241,.12)]">
                <span className="block text-[17px] font-black">{title}</span>
                <span className="mt-2 block text-sm leading-6 text-[#6b7280]">{detail}</span>
                <span className="mt-4 inline-flex text-sm font-extrabold text-[#4f46e5]">Open</span>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
            {stats.map((stat) => (
              <article key={stat.title} className="rounded-[24px] border border-white/70 bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.045)]">
                <h3 className="mb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">{stat.title}</h3>
                <p className="text-[28px] font-black leading-none text-[#111827]">{stat.value}</p>
                <p className="mt-3 text-sm leading-6 text-[#6b7280]">{stat.detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
            <article className="rounded-[26px] border border-white/70 bg-white p-6 shadow-[0_10px_28px_rgba(0,0,0,0.045)]">
              <h2 className="text-[24px] font-black">Portal Status</h2>
              <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                Live reads use Supabase when your public policies allow it. Protected credit and design actions still use the
                authenticated PRNTD API proxy.
              </p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#eef2ff]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(135deg,#3b82f6,#6366f1,#7c3aed)]"
                  style={{
                    width: subscription?.max_qr_limit
                      ? `${Math.min(((subscription.active_qr_count ?? 0) / subscription.max_qr_limit) * 100, 100)}%`
                      : "0%",
                  }}
                />
              </div>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-[#6b7280]">
                QR usage {subscription?.active_qr_count ?? 0}/{subscription?.max_qr_limit ?? 0}
              </p>
            </article>
            <article className="rounded-[26px] border border-white/70 bg-white p-6 shadow-[0_10px_28px_rgba(0,0,0,0.045)]">
              <h2 className="text-[24px] font-black">Next Best Step</h2>
              <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                Keep a saved design ready, then open a print product and attach it before checkout.
              </p>
              <Link href="/products" className="design-main-btn">
                Choose Product
              </Link>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
