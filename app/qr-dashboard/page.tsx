"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  BarChart3,
  Copy,
  ExternalLink,
  Globe,
  Link2,
  Plus,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Download,
  Sparkles,
} from "lucide-react";

import PortalSidebar from "@/components/PortalSidebar";
import ShopHeader from "@/components/ShopHeader";

import { usePrntdAccount } from "@/hooks/usePrntdAccount";

import {
  fetchQrAnalytics,
  fetchQrLinks,
  fetchSubscription,
  QrAnalytics,
  QrLink,
  SubscriptionResponse,
} from "@/lib/prntdClient";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function QrDashboardPage() {
  const {
    email,
    token,
    status: accountStatus,
    loadAccount,
  } = usePrntdAccount();

  const [status, setStatus] =
    useState("");

  const [qrs, setQrs] = useState<
    QrLink[]
  >([]);

  const [analytics, setAnalytics] =
    useState<QrAnalytics | null>(
      null,
    );

  const [
    subscription,
    setSubscription,
  ] =
    useState<SubscriptionResponse | null>(
      null,
    );

  const [title, setTitle] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [destination, setDestination] =
    useState("");

  const [creating, setCreating] =
    useState(false);

  const [staticQrValue, setStaticQrValue] =
    useState("");

  const [staticQrData, setStaticQrData] =
    useState("");

  const refresh = useCallback(async () => {
    const session =
      email && token
        ? { email, token }
        : await loadAccount();

    if (!session?.email) {
      setStatus(
        "Sign in to load QR data.",
      );

      return;
    }

    setStatus(
      "Loading QR dashboard...",
    );

    try {
      const [
        qrData,
        analyticsData,
        subscriptionData,
      ] = await Promise.all([
        fetchQrLinks(
          session.email,
          session.token,
        ),
        fetchQrAnalytics(
          session.email,
          session.token,
        ),
        fetchSubscription(
          session.email,
          session.token,
        ),
      ]);

      setQrs(
        Array.isArray(qrData)
          ? qrData
          : [],
      );

      setAnalytics(
        analyticsData,
      );

      setSubscription(
        subscriptionData,
      );

      setStatus(
        "QR dashboard loaded.",
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Unable to load QR dashboard.",
      );
    }
  }, [email, token, loadAccount]);

  useEffect(() => {
    if (!email || !token) return;

    const timer =
      window.setTimeout(() => {
        void refresh();
      }, 0);

    return () =>
      window.clearTimeout(timer);
  }, [email, token, refresh]);

  const stats = useMemo(
    () => [
      {
        label: "QR Usage",
        value: `${
          subscription?.active_qr_count ??
          qrs.length
        }/${
          subscription?.max_qr_limit ??
          0
        }`,
        icon: QrCode,
      },
      {
        label: "Monthly Scans",
        value: String(
          analytics?.monthlyScansTotal ??
            0,
        ),
        icon: Activity,
      },
      {
        label: "Unique Visitors",
        value: String(
          analytics?.uniqueVisitors ??
            0,
        ),
        icon: Globe,
      },
      {
        label: "Top Country",
        value:
          analytics?.topCountry ??
          "-",
        icon: BarChart3,
      },
    ],
    [analytics, qrs.length, subscription],
  );

  async function createQr() {
    if (
      !title.trim() ||
      !destination.trim()
    ) {
      setStatus(
        "Title and destination URL are required.",
      );

      return;
    }

    setCreating(true);

    setStatus(
      "Creating QR code...",
    );

    try {
      const session = token
        ? { token }
        : await loadAccount();

      if (!session?.token) {
        throw new Error(
          "Sign in required.",
        );
      }

      const response =
        await fetch(
          "/api/prntd/create-qr",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${session.token}`,
            },
            body: JSON.stringify({
              title,
              slug: slugify(
                slug || title,
              ),
              destination_url:
                destination,
              active: true,
            }),
          },
        );

      const data =
        (await response.json()) as {
          success?: boolean;
          error?: string;
          short_url?: string;
        };

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ??
            "Failed to create QR.",
        );
      }

      setTitle("");
      setSlug("");
      setDestination("");

      setStatus(
        `Created: ${data.short_url}`,
      );

      await refresh();
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "QR creation failed.",
      );
    } finally {
      setCreating(false);
    }
  }

  function createStaticQr() {
    const value =
      staticQrValue.trim();

    if (!value) {
      setStatus(
        "Enter a URL or text value.",
      );

      return;
    }

    setStaticQrData(value);

    setStatus(
      "Free static QR generated.",
    );
  }

  function downloadStaticQr() {
    if (!staticQrData) return;

    const url = `https://api.qrserver.com/v1/create-qr-code/?size=900x900&format=png&data=${encodeURIComponent(staticQrData)}`;

    const anchor =
      document.createElement("a");

    anchor.href = url;

    anchor.download = `prntd-static-qr-${Date.now()}.png`;

    anchor.target = "_blank";

    document.body.appendChild(anchor);

    anchor.click();

    anchor.remove();
  }

  async function updateQr(
    qr: QrLink,
    nextUrl: string,
  ) {
    try {
      const session = token
        ? { token }
        : await loadAccount();

      if (!session?.token) {
        throw new Error(
          "Sign in required.",
        );
      }

      const response =
        await fetch(
          "/api/prntd/update-qr",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${session.token}`,
            },
            body: JSON.stringify({
              slug: qr.slug,
              destination_url:
                nextUrl,
            }),
          },
        );

      const data =
        (await response.json()) as {
          success?: boolean;
          error?: string;
        };

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ??
            "Update failed.",
        );
      }

      await refresh();
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Update failed.",
      );
    }
  }

  async function deleteQr(
    qr: QrLink,
  ) {
    if (
      !window.confirm(
        `Delete ${qr.title}?`,
      )
    ) {
      return;
    }

    try {
      const session = token
        ? { token }
        : await loadAccount();

      if (!session?.token) {
        throw new Error(
          "Sign in required.",
        );
      }

      const response =
        await fetch(
          "/api/prntd/delete-qr",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${session.token}`,
            },
            body: JSON.stringify({
              slug: qr.slug,
            }),
          },
        );

      const data =
        (await response.json()) as {
          success?: boolean;
          error?: string;
        };

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ??
            "Delete failed.",
        );
      }

      await refresh();
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Delete failed.",
      );
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* BG */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[#4f46e5]/20 blur-[140px]" />

        <div className="absolute bottom-[-15%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[#2563eb]/20 blur-[160px]" />
      </div>

      <div className="relative z-10">
        <ShopHeader />

        <div className="mx-auto flex max-w-[1700px] gap-6 px-5 py-10 max-[1100px]:flex-col">
          <PortalSidebar />

          <section className="min-w-0 flex-1">
            {/* HERO */}
            <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#111827_40%,#312e81_100%)] p-8 shadow-[0_35px_120px_rgba(0,0,0,0.45)] sm:p-10">
              <div className="absolute right-[-10%] top-[-10%] h-[320px] w-[320px] rounded-full bg-[#8b5cf6]/20 blur-[120px]" />

              <div className="relative flex flex-wrap items-end justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#c7d2fe]">
                    <Sparkles className="h-4 w-4" />
                    Smart QR Platform
                  </div>

                  <h1 className="mt-7 text-[clamp(52px,6vw,92px)] font-black leading-[0.92] tracking-[-0.06em]">
                    QR
                    <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                      Manager
                    </span>
                  </h1>

                  <p className="mt-6 max-w-3xl text-lg leading-9 text-[#cbd5e1]">
                    Create dynamic QR
                    campaigns with live
                    analytics, editable
                    redirects, visitor
                    tracking, and branded
                    short links.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void refresh()
                  }
                  className="inline-flex items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] px-7 py-4 text-sm font-black text-white shadow-[0_20px_60px_rgba(99,102,241,0.35)] transition hover:-translate-y-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Data
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
                    {status ||
                      accountStatus}
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-[#0f172a]/80 px-6 py-5">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                    Active QR Codes
                  </p>

                  <p className="mt-3 text-[44px] font-black leading-none">
                    {qrs.length}
                  </p>
                </div>
              </div>
            </div>

            {/* STATS */}
            <div className="mt-6 grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
              {stats.map((stat) => (
                <article
                  key={stat.label}
                  className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl"
                >
                  <div className="flex items-center justify-between">
                    <stat.icon className="h-6 w-6 text-[#818cf8]" />

                    <ShieldCheck className="h-5 w-5 text-[#22c55e]" />
                  </div>

                  <p className="mt-6 text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                    {stat.label}
                  </p>

                  <p className="mt-3 text-[38px] font-black leading-none">
                    {stat.value}
                  </p>
                </article>
              ))}
            </div>

            {/* STATIC QR */}
            <section className="mt-6 overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-2xl shadow-[0_25px_90px_rgba(0,0,0,0.35)]">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#818cf8]">
                    Free Static QR
                  </p>

                  <h2 className="mt-3 text-4xl font-black tracking-[-0.04em]">
                    Generate Static QR
                  </h2>

                  <p className="mt-5 max-w-2xl text-[15px] leading-8 text-[#cbd5e1]">
                    Static QR codes are
                    completely free and
                    point directly to the
                    entered URL or text.
                    No analytics or
                    redirect tracking.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input
                      value={
                        staticQrValue
                      }
                      onChange={(
                        event,
                      ) =>
                        setStaticQrValue(
                          event
                            .target
                            .value,
                        )
                      }
                      className="h-[58px] rounded-2xl border border-white/10 bg-[#0f172a]/80 px-5 text-white placeholder:text-[#64748b]"
                      placeholder="https://example.com"
                    />

                    <button
                      type="button"
                      onClick={
                        createStaticQr
                      }
                      className="rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] px-7 py-4 text-sm font-black text-white"
                    >
                      Generate QR
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[#0f172a]/80 p-5 text-center">
                  {staticQrData ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(staticQrData)}`}
                        alt="QR"
                        className="mx-auto aspect-square w-full max-w-[220px]"
                      />

                      <button
                        type="button"
                        onClick={
                          downloadStaticQr
                        }
                        className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-black text-white"
                      >
                        <Download className="h-4 w-4" />
                        Download PNG
                      </button>
                    </>
                  ) : (
                    <div className="grid min-h-[240px] place-items-center rounded-[24px] border border-dashed border-white/10 text-sm font-bold text-[#94a3b8]">
                      QR Preview
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* CREATE */}
            <section className="mt-6 overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-2xl shadow-[0_25px_90px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-3">
                <Plus className="h-6 w-6 text-[#818cf8]" />

                <h2 className="text-4xl font-black tracking-[-0.04em]">
                  Create Smart QR
                </h2>
              </div>

              <div className="mt-7 grid gap-4 lg:grid-cols-3">
                <input
                  value={title}
                  onChange={(
                    event,
                  ) =>
                    setTitle(
                      event.target.value,
                    )
                  }
                  className="h-[58px] rounded-2xl border border-white/10 bg-[#0f172a]/80 px-5 text-white placeholder:text-[#64748b]"
                  placeholder="Campaign title"
                />

                <input
                  value={slug}
                  onChange={(
                    event,
                  ) =>
                    setSlug(
                      event.target.value,
                    )
                  }
                  className="h-[58px] rounded-2xl border border-white/10 bg-[#0f172a]/80 px-5 text-white placeholder:text-[#64748b]"
                  placeholder="Custom slug"
                />

                <input
                  value={destination}
                  onChange={(
                    event,
                  ) =>
                    setDestination(
                      event.target.value,
                    )
                  }
                  className="h-[58px] rounded-2xl border border-white/10 bg-[#0f172a]/80 px-5 text-white placeholder:text-[#64748b]"
                  placeholder="Destination URL"
                />
              </div>

              <button
                type="button"
                onClick={createQr}
                disabled={creating}
                className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] px-8 py-5 text-sm font-black text-white shadow-[0_20px_60px_rgba(99,102,241,0.35)]"
              >
                <QrCode className="h-5 w-5" />

                {creating
                  ? "Creating..."
                  : "Create QR Code"}
              </button>
            </section>

            {/* QR LIST */}
            <section className="mt-6 overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_25px_90px_rgba(0,0,0,0.35)]">
              <div className="border-b border-white/10 p-7">
                <h2 className="text-4xl font-black tracking-[-0.04em]">
                  Your QR Codes
                </h2>
              </div>

              {qrs.length === 0 ? (
                <div className="p-7 text-[#94a3b8]">
                  No QR codes yet.
                </div>
              ) : (
                <div className="grid gap-5 p-5">
                  {qrs.map((qr) => (
                    <article
                      key={qr.slug}
                      className="grid gap-5 rounded-[30px] border border-white/10 bg-[#0f172a]/70 p-5 lg:grid-cols-[180px_minmax(0,1fr)_170px]"
                    >
                      {/* QR */}
                      <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white p-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`https://go.prntd.ca/${qr.slug}`)}`}
                          alt={
                            qr.title
                          }
                          className="w-full"
                        />
                      </div>

                      {/* INFO */}
                      <div className="min-w-0">
                        <h3 className="text-2xl font-black">
                          {qr.title}
                        </h3>

                        <p className="mt-2 break-all text-sm font-bold text-[#818cf8]">
                          https://go.prntd.ca/
                          {qr.slug}
                        </p>

                        <input
                          defaultValue={
                            qr.destination_url
                          }
                          onBlur={(
                            event,
                          ) => {
                            if (
                              event
                                .target
                                .value !==
                              qr.destination_url
                            ) {
                              void updateQr(
                                qr,
                                event
                                  .target
                                  .value,
                              );
                            }
                          }}
                          className="mt-4 h-[54px] w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-white"
                        />

                        <p className="mt-4 text-sm text-[#94a3b8]">
                          {qr.monthly_scans ??
                            0}{" "}
                          monthly scans •{" "}
                          {qr.url_health ??
                            "unknown"}
                        </p>
                      </div>

                      {/* ACTIONS */}
                      <div className="grid content-start gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(
                              `https://go.prntd.ca/${qr.slug}`,
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-black text-white"
                        >
                          <Copy className="h-4 w-4" />
                          Copy Link
                        </button>

                        <a
                          href={`https://go.prntd.ca/${qr.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-black text-white"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open
                        </a>

                        <button
                          type="button"
                          onClick={() =>
                            void deleteQr(
                              qr,
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-black text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </section>
        </div>
      </div>
    </main>
  );
}