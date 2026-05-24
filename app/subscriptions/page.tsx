"use client";

import { useCallback, useEffect, useState } from "react";
import PortalSidebar from "@/components/PortalSidebar";
import ShopHeader from "@/components/ShopHeader";
import { usePrntdAccount } from "@/hooks/usePrntdAccount";

type SubscriptionPlan = {
  id: "starter" | "pro" | "business";
  name: string;
  price: string;
  link: string;
  popular?: boolean;
  features: string[];
};

const plans: SubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$5",
    link: "https://buy.stripe.com/3cI9ASdPFcpX2Vu30K97G06",
    features: [
      "1 Dynamic Custom QR Code",
      "20 Saved Designs",
      "15 Design Creations or 7 Background Removals /month",
      "Editable destination",
      "7-day free trial with limited trial credits",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$15",
    link: "https://buy.stripe.com/6oU8wO7rh75DdA8eJs97G05",
    popular: true,
    features: [
      "5 Dynamic Custom QR Codes",
      "100 Saved Designs",
      "40 Design Creations or 20 Background Removals /month",
      "Full analytics",
      "Custom styling + logos",
      "7-day free trial with limited trial credits",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: "$29",
    link: "https://buy.stripe.com/14A14mcLB61z8fO44O97G04",
    features: [
      "10 Dynamic Custom QR Codes",
      "400 Saved Designs",
      "85 Design Creations or 42 Background Removals /month",
      "Priority support",
      "7-day free trial with limited trial credits",
    ],
  },
];

const creditPacks = [
  { label: "25 Credits", price: "$7 CAD" },
  { label: "50 Credits", price: "$11 CAD" },
  { label: "100 Credits", price: "$19 CAD" },
];

export default function SubscriptionsPage() {
  const { email, token, status: accountStatus, loadAccount } = usePrntdAccount();
  const [currentPlan, setCurrentPlan] = useState("none");
  const [status, setStatus] = useState("Loading your subscription...");

  const checkPlan = useCallback(async () => {
    const session = email && token ? { email, token } : await loadAccount();

    if (!session?.email || !session.token) {
      setStatus(accountStatus);
      return;
    }

    setStatus("Checking subscription...");

    try {
      const response = await fetch(`/api/prntd/get-subscription?email=${encodeURIComponent(session.email)}`, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      const data = (await response.json()) as { plan_type?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not load subscription.");
      }

      setCurrentPlan(data.plan_type || "none");
      setStatus(data.plan_type ? `Current plan: ${data.plan_type}` : "No active plan found.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Subscription lookup failed.");
    }
  }, [accountStatus, email, token, loadAccount]);

  useEffect(() => {
    if (!email) return;
    const timer = window.setTimeout(() => {
      void checkPlan();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [email, checkPlan]);

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <ShopHeader />
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 pb-20 font-sans sm:px-6 lg:grid-cols-[290px_minmax(0,1fr)] lg:px-8">
        <PortalSidebar />
        <div>
        <header className="mb-10 text-center">
          <div className="mb-6 inline-flex rounded-full border border-[#dfe7ff] bg-[linear-gradient(135deg,#eef4ff_0%,#eef2ff_45%,#f5f3ff_100%)] px-4 py-2.5 text-[13px] font-bold text-[#4f46e5]">
            7 Day Free Trial - Cancel Anytime
          </div>
          <h1 className="text-[clamp(38px,5vw,60px)] font-extrabold leading-[1.02] tracking-normal">Upgrade Your Experience</h1>
          <p className="mx-auto mt-4 max-w-[760px] text-[17px] leading-7 text-[#6b7280]">
            Unlock dynamic QR codes, analytics, saved designs, customization, and premium business tools.
          </p>
          <div className="mx-auto mt-6 max-w-xl rounded-[22px] border border-white/70 bg-white px-5 py-4 text-left shadow-[0_10px_28px_rgba(0,0,0,0.045)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">Customer Account</p>
            <p className="mt-1 font-black text-[#111827]">{email || "Loading..."}</p>
            <button type="button" onClick={() => void checkPlan()} className="portal-action mt-3">
              Refresh Plan
            </button>
          </div>
          <p className="mt-3 text-sm font-semibold text-[#6b7280]">{status}</p>
        </header>

        <div className="grid grid-cols-3 gap-6 max-[980px]:grid-cols-1">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;

            return (
              <article
                key={plan.id}
                className={`relative flex flex-col justify-between overflow-hidden rounded-[30px] border bg-white/90 p-[34px] shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(0,0,0,0.08)] ${
                  plan.popular ? "scale-[1.02] border-2 border-[#818cf8] max-[980px]:scale-100" : "border-white/50"
                }`}
              >
                <div>
                  {plan.popular && (
                    <div className="mb-4 inline-block rounded-full bg-[linear-gradient(135deg,#3b82f6,#6366f1_45%,#7c3aed)] px-3 py-1.5 text-[11px] font-extrabold tracking-[0.05em] text-white">
                      MOST POPULAR
                    </div>
                  )}
                  <h2 className="text-2xl font-extrabold tracking-normal">{plan.name}</h2>
                  <p className="my-5 text-[52px] font-extrabold leading-none tracking-normal">
                    {plan.price} <span className="text-[15px] font-semibold text-[#6b7280]">/ month</span>
                  </p>
                  <ul className="mb-7 grid gap-3.5 text-sm leading-6 text-[#374151]">
                    {plan.features.map((feature) => (
                      <li key={feature}>- {feature}</li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  disabled={isCurrent}
                  onClick={() => window.open(plan.link, "_blank")}
                  className={`w-full rounded-[18px] px-4 py-4 text-[15px] font-bold text-white shadow-[0_10px_22px_rgba(99,102,241,0.16)] transition ${
                    isCurrent
                      ? "cursor-not-allowed bg-[#d1d5db]"
                      : "bg-[linear-gradient(135deg,#3b82f6,#6366f1_45%,#7c3aed)] hover:-translate-y-0.5"
                  }`}
                >
                  {isCurrent ? "Current Plan" : currentPlan === "none" ? `Start Free Trial - ${plan.name}` : `Switch to ${plan.name}`}
                </button>
              </article>
            );
          })}
        </div>

        <section className="mt-[60px] rounded-[32px] border border-white/50 bg-white/90 p-[38px] shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
          <h2 className="text-4xl font-extrabold tracking-normal max-sm:text-center max-sm:text-3xl">Top-Up Credits</h2>
          <p className="mt-3 text-[15px] leading-7 text-[#6b7280] max-sm:text-center">
            Buy additional credits for design generation and background removal.
          </p>
          <div className="mt-7 grid grid-cols-3 gap-5 max-[980px]:grid-cols-1">
            {creditPacks.map((pack) => (
              <article key={pack.label} className="rounded-3xl border border-[#e7eaf3] bg-white p-7 text-center transition hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(0,0,0,0.05)]">
                <p className="text-sm font-bold text-[#6b7280]">{pack.label}</p>
                <p className="my-4 text-[38px] font-extrabold tracking-normal">{pack.price}</p>
                <button type="button" className="w-full rounded-2xl bg-[linear-gradient(135deg,#3b82f6,#6366f1_45%,#7c3aed)] px-4 py-3.5 text-sm font-bold text-white">
                  Coming Soon
                </button>
              </article>
            ))}
          </div>
          <p className="mt-8 border-t border-[#e7eaf3] pt-7 text-center text-sm leading-8 text-[#4b5563] max-sm:text-left">
            <strong>How credits work:</strong>
            <br />
            Subscription plans include monthly credits that refresh each billing cycle. New subscriptions begin with a limited 7-day trial credit balance.
            Credits are used for the design creator and background remover only. Top-up credits never expire and are used after subscription credits are depleted.
          </p>
        </section>

        <p className="mt-7 text-center text-sm text-[#6b7280]">Cancel anytime. No contracts.</p>
        </div>
      </section>
    </main>
  );
}
