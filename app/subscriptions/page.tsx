"use client";

import { useCallback, useEffect, useState } from "react";

import {
  ArrowRight,
  Check,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

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
  {
    label: "25 Credits",
    price: "$7 CAD",
  },
  {
    label: "50 Credits",
    price: "$11 CAD",
  },
  {
    label: "100 Credits",
    price: "$19 CAD",
  },
];

export default function SubscriptionsPage() {
  const {
    email,
    token,
    status: accountStatus,
    loadAccount,
  } = usePrntdAccount();

  const [currentPlan, setCurrentPlan] =
    useState("none");

  const [status, setStatus] =
    useState(
      "Loading your subscription...",
    );

  const checkPlan =
    useCallback(async () => {
      const session =
        email && token
          ? { email, token }
          : await loadAccount();

      if (
        !session?.email ||
        !session.token
      ) {
        setStatus(accountStatus);

        return;
      }

      setStatus(
        "Checking subscription...",
      );

      try {
        const response =
          await fetch(
            `/api/prntd/get-subscription?email=${encodeURIComponent(session.email)}`,
            {
              headers: {
                Authorization: `Bearer ${session.token}`,
              },
            },
          );

        const data =
          (await response.json()) as {
            plan_type?: string;
            error?: string;
          };

        if (!response.ok) {
          throw new Error(
            data.error ??
              "Could not load subscription.",
          );
        }

        setCurrentPlan(
          data.plan_type ||
            "none",
        );

        setStatus(
          data.plan_type
            ? `Current plan: ${data.plan_type}`
            : "No active plan found.",
        );
      } catch (error) {
        setStatus(
          error instanceof Error
            ? error.message
            : "Subscription lookup failed.",
        );
      }
    }, [
      accountStatus,
      email,
      token,
      loadAccount,
    ]);

  useEffect(() => {
    if (!email) return;

    const timer =
      window.setTimeout(() => {
        void checkPlan();
      }, 0);

    return () =>
      window.clearTimeout(timer);
  }, [email, checkPlan]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* BG */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[#4f46e5]/20 blur-[140px]" />

        <div className="absolute bottom-[-15%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[#2563eb]/20 blur-[160px]" />
      </div>

      <div className="relative z-10">
        <ShopHeader />

        <section className="mx-auto flex w-full max-w-[1700px] gap-6 px-5 py-10 max-[1100px]:flex-col">
          <PortalSidebar />

          <div className="min-w-0 flex-1">
            {/* HERO */}
            <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#111827_40%,#312e81_100%)] p-8 shadow-[0_35px_120px_rgba(0,0,0,0.45)] sm:p-10">
              <div className="absolute right-[-10%] top-[-10%] h-[320px] w-[320px] rounded-full bg-[#8b5cf6]/20 blur-[120px]" />

              <div className="relative flex flex-wrap items-end justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#c7d2fe]">
                    <Sparkles className="h-4 w-4" />
                    Premium Creator Tools
                  </div>

                  <h1 className="mt-7 text-[clamp(52px,6vw,92px)] font-black leading-[0.92] tracking-[-0.06em]">
                    Upgrade
                    <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                      Your Experience
                    </span>
                  </h1>

                  <p className="mt-6 max-w-3xl text-lg leading-9 text-[#cbd5e1]">
                    Unlock AI generation,
                    premium QR analytics,
                    saved designs,
                    customization tools,
                    and advanced business
                    features.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void checkPlan()
                  }
                  className="inline-flex items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] px-7 py-4 text-sm font-black text-white shadow-[0_20px_60px_rgba(99,102,241,0.35)] transition hover:-translate-y-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Plan
                </button>
              </div>
            </div>

            {/* ACCOUNT */}
            <div className="mt-6 rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[0_25px_90px_rgba(0,0,0,0.35)]">
              <div className="flex flex-wrap items-center justify-between gap-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                    Creator Account
                  </p>

                  <p className="mt-3 text-2xl font-black">
                    {email ||
                      "Loading..."}
                  </p>

                  <p className="mt-2 text-sm text-[#94a3b8]">
                    {status}
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-[#0f172a]/80 px-6 py-5">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                    Current Plan
                  </p>

                  <p className="mt-3 text-[44px] font-black leading-none capitalize">
                    {currentPlan}
                  </p>
                </div>
              </div>
            </div>

            {/* PRICING */}
            <div className="mt-6 grid gap-6 xl:grid-cols-3">
              {plans.map((plan) => {
                const isCurrent =
                  currentPlan ===
                  plan.id;

                return (
                  <article
                    key={plan.id}
                    className={`relative overflow-hidden rounded-[36px] border p-8 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 ${
                      plan.popular
                        ? "border-[#6366f1]/40 bg-[linear-gradient(180deg,rgba(99,102,241,0.18),rgba(255,255,255,0.04))] shadow-[0_30px_80px_rgba(99,102,241,0.22)]"
                        : "border-white/10 bg-white/[0.04] shadow-[0_25px_70px_rgba(0,0,0,0.28)]"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute right-5 top-5 rounded-full bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.08em] text-white">
                        Most Popular
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] shadow-[0_15px_40px_rgba(99,102,241,0.35)]">
                        <Zap className="h-5 w-5 text-white" />
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                          Subscription Plan
                        </p>

                        <h2 className="mt-1 text-3xl font-black">
                          {plan.name}
                        </h2>
                      </div>
                    </div>

                    <div className="mt-8 flex items-end gap-3">
                      <span className="text-[68px] font-black leading-none tracking-[-0.05em]">
                        {plan.price}
                      </span>

                      <span className="pb-2 text-sm font-bold text-[#94a3b8]">
                        / month
                      </span>
                    </div>

                    <div className="mt-8 grid gap-4">
                      {plan.features.map(
                        (
                          feature,
                        ) => (
                          <div
                            key={
                              feature
                            }
                            className="flex items-start gap-3"
                          >
                            <div className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#22c55e]/15">
                              <Check className="h-3.5 w-3.5 text-[#22c55e]" />
                            </div>

                            <p className="text-sm leading-7 text-[#cbd5e1]">
                              {
                                feature
                              }
                            </p>
                          </div>
                        ),
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={
                        isCurrent
                      }
                      onClick={() =>
                        window.open(
                          plan.link,
                          "_blank",
                        )
                      }
                      className={`mt-10 flex w-full items-center justify-center gap-3 rounded-[24px] px-6 py-5 text-sm font-black transition ${
                        isCurrent
                          ? "cursor-not-allowed border border-white/10 bg-white/[0.06] text-[#94a3b8]"
                          : "bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] text-white shadow-[0_20px_60px_rgba(99,102,241,0.35)] hover:-translate-y-1"
                      }`}
                    >
                      {isCurrent
                        ? "Current Plan"
                        : currentPlan ===
                            "none"
                          ? `Start Free Trial`
                          : `Switch To ${plan.name}`}

                      {!isCurrent && (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </button>
                  </article>
                );
              })}
            </div>

            {/* CREDIT PACKS */}
            <section className="mt-6 overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-2xl shadow-[0_25px_90px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-[#818cf8]" />

                <h2 className="text-4xl font-black tracking-[-0.04em]">
                  Top-Up Credits
                </h2>
              </div>

              <p className="mt-5 max-w-2xl text-[15px] leading-8 text-[#cbd5e1]">
                Purchase additional
                credits for AI design
                generation and
                background removal.
              </p>

              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {creditPacks.map(
                  (pack) => (
                    <article
                      key={
                        pack.label
                      }
                      className="rounded-[30px] border border-white/10 bg-[#0f172a]/80 p-7 text-center transition hover:-translate-y-1 hover:border-[#6366f1]/30"
                    >
                      <p className="text-sm font-black uppercase tracking-[0.12em] text-[#94a3b8]">
                        {
                          pack.label
                        }
                      </p>

                      <p className="mt-5 text-[48px] font-black leading-none">
                        {
                          pack.price
                        }
                      </p>

                      <button
                        type="button"
                        className="mt-7 w-full rounded-2xl bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] px-5 py-4 text-sm font-black text-white shadow-[0_15px_40px_rgba(99,102,241,0.28)]"
                      >
                        Coming Soon
                      </button>
                    </article>
                  ),
                )}
              </div>

              {/* INFO */}
              <div className="mt-8 rounded-[28px] border border-white/10 bg-[#0f172a]/70 p-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#22c55e]" />

                  <p className="text-sm font-black">
                    How Credits Work
                  </p>
                </div>

                <p className="mt-5 text-[15px] leading-8 text-[#cbd5e1]">
                  Subscription plans
                  include monthly
                  credits that refresh
                  every billing cycle.
                  Trial subscriptions
                  include limited trial
                  credits. Top-up
                  credits never expire
                  and are consumed
                  after subscription
                  credits are depleted.
                </p>
              </div>
            </section>

            <p className="mt-7 text-center text-sm font-semibold text-[#94a3b8]">
              Cancel anytime. No
              contracts.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}