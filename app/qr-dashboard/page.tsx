"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AccountConnect from "@/components/AccountConnect";
import PortalSidebar from "@/components/PortalSidebar";
import ShopHeader from "@/components/ShopHeader";
import {
  fetchQrAnalytics,
  fetchQrLinks,
  fetchSubscription,
  getStoredEmail,
  getTokenOrCreate,
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
  const [email, setEmail] = useState(getStoredEmail);
  const [status, setStatus] = useState("");
  const [qrs, setQrs] = useState<QrLink[]>([]);
  const [analytics, setAnalytics] = useState<QrAnalytics | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [destination, setDestination] = useState("");
  const [creating, setCreating] = useState(false);
  const [staticQrValue, setStaticQrValue] = useState("");
  const [staticQrData, setStaticQrData] = useState("");

  const refresh = useCallback(async () => {
    if (!email.trim()) {
      setStatus("Enter your account email to load QR data.");
      return;
    }

    setStatus("Loading QR dashboard...");

    try {
      const [qrData, analyticsData, subscriptionData] = await Promise.all([
        fetchQrLinks(email),
        fetchQrAnalytics(email),
        fetchSubscription(email),
      ]);

      setQrs(Array.isArray(qrData) ? qrData : []);
      setAnalytics(analyticsData);
      setSubscription(subscriptionData);
      setStatus("QR dashboard loaded.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to load QR dashboard.");
    }
  }, [email]);

  useEffect(() => {
    if (!email) return;
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [email, refresh]);

  const stats = useMemo(
    () => [
      { label: "QR Usage", value: `${subscription?.active_qr_count ?? qrs.length}/${subscription?.max_qr_limit ?? 0}` },
      { label: "Monthly Scans", value: String(analytics?.monthlyScansTotal ?? 0) },
      { label: "Unique Visitors", value: String(analytics?.uniqueVisitors ?? 0) },
      { label: "Top Country", value: analytics?.topCountry ?? "-" },
      { label: "Top Device", value: analytics?.topDevice ?? "-" },
      { label: "URL Health", value: analytics?.urlHealth ?? "-" },
    ],
    [analytics, qrs.length, subscription]
  );

  async function createQr() {
    if (!title.trim() || !destination.trim()) {
      setStatus("Title and destination URL are required.");
      return;
    }

    setCreating(true);
    setStatus("Creating QR code...");

    try {
      const token = await getTokenOrCreate(email);
      const response = await fetch("/api/prntd/create-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          slug: slugify(slug || title),
          destination_url: destination,
          active: true,
        }),
      });
      const data = (await response.json()) as { success?: boolean; error?: string; short_url?: string };

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Failed to create QR.");
      }

      setTitle("");
      setSlug("");
      setDestination("");
      setStatus(`Created: ${data.short_url}`);
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "QR creation failed.");
    } finally {
      setCreating(false);
    }
  }

  function createStaticQr() {
    const value = staticQrValue.trim();

    if (!value) {
      setStatus("Enter a URL or text value for your free static QR code.");
      return;
    }

    setStaticQrData(value);
    setStatus("Free static QR code generated. This QR does not track scans or use a redirect.");
  }

  function downloadStaticQr() {
    if (!staticQrData) return;

    const url = `https://api.qrserver.com/v1/create-qr-code/?size=900x900&format=png&data=${encodeURIComponent(staticQrData)}`;
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `prntd-static-qr-${Date.now()}.png`;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  async function updateQr(qr: QrLink, nextUrl: string) {
    try {
      const token = await getTokenOrCreate(email);
      const response = await fetch("/api/prntd/update-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug: qr.slug,
          destination_url: nextUrl,
        }),
      });
      const data = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !data.success) throw new Error(data.error ?? "Update failed.");

      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Update failed.");
    }
  }

  async function deleteQr(qr: QrLink) {
    if (!window.confirm(`Delete ${qr.title}?`)) return;

    try {
      const token = await getTokenOrCreate(email);
      const response = await fetch("/api/prntd/delete-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slug: qr.slug }),
      });
      const data = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !data.success) throw new Error(data.error ?? "Delete failed.");

      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Delete failed.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <ShopHeader />
      <div className="mx-auto flex max-w-[1400px] gap-[30px] px-5 py-10 max-[900px]:flex-col">
        <PortalSidebar />
        <section className="min-w-0 flex-1">
          <div className="mb-6">
            <h1 className="text-[clamp(42px,5vw,70px)] font-extrabold leading-[1.02] tracking-normal">QR Manager</h1>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-[#6b7280]">
              Create editable QR campaigns with analytics, scan tracking, redirects, and URL health checks.
            </p>
          </div>

          <AccountConnect email={email} setEmail={setEmail} onConnect={refresh} status={status} />

          <section className="prntd-glass mt-6 p-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#4f46e5]">Free Static QR</p>
                <h2 className="mt-2 text-3xl font-black">Make a non-dynamic QR code</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6b7280]">
                  Static QR codes are free and do not require an account. They point directly to the URL or text you enter, so
                  the destination cannot be edited later and scans are not tracked.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    value={staticQrValue}
                    onChange={(event) => setStaticQrValue(event.target.value)}
                    className="portal-field"
                    placeholder="https://example.com or plain text"
                  />
                  <button type="button" onClick={createStaticQr} className="portal-action">
                    Generate Free QR
                  </button>
                </div>
              </div>
              <div className="rounded-[24px] bg-white p-4 text-center shadow-[inset_0_0_0_1px_rgba(99,102,241,.08)]">
                {staticQrData ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(staticQrData)}`}
                      alt="Free static QR code"
                      className="mx-auto aspect-square w-full max-w-[190px]"
                    />
                    <button type="button" onClick={downloadStaticQr} className="design-utility-btn mt-3 w-full">
                      Download PNG
                    </button>
                  </>
                ) : (
                  <div className="grid min-h-[190px] place-items-center rounded-[20px] bg-[#f5f7fb] p-5 text-sm font-bold text-[#6b7280]">
                    Your free QR preview appears here.
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="mt-6 grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
            {stats.map((stat) => (
              <article key={stat.label} className="prntd-glass p-5">
                <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#6b7280]">{stat.label}</h2>
                <p className="mt-2 text-3xl font-black">{stat.value}</p>
              </article>
            ))}
          </div>

          <section className="prntd-glass mt-6 p-6">
            <h2 className="text-3xl font-black">Create Smart QR</h2>
            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              <input value={title} onChange={(event) => setTitle(event.target.value)} className="portal-field" placeholder="Campaign title" />
              <input value={slug} onChange={(event) => setSlug(event.target.value)} className="portal-field" placeholder="Custom slug" />
              <input value={destination} onChange={(event) => setDestination(event.target.value)} className="portal-field" placeholder="Destination URL" />
            </div>
            <button type="button" onClick={createQr} disabled={creating} className="design-main-btn">
              {creating ? "Creating..." : "Create QR Code"}
            </button>
          </section>

          <section className="prntd-glass mt-6 overflow-hidden p-0">
            <div className="border-b border-[#e7eaf3] p-6">
              <h2 className="text-3xl font-black">Your QR Codes</h2>
            </div>
            {qrs.length === 0 ? (
              <p className="p-6 text-[#6b7280]">No QR codes yet.</p>
            ) : (
              <div className="grid gap-4 p-4">
                {qrs.map((qr) => (
                  <article key={qr.slug} className="grid gap-4 rounded-3xl border border-[#e7eaf3] bg-white p-4 lg:grid-cols-[140px_minmax(0,1fr)_160px]">
                    <div className="rounded-2xl bg-[#f9fafb] p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`https://go.prntd.ca/${qr.slug}`)}`}
                        alt={`QR code for ${qr.title}`}
                        className="w-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-black">{qr.title}</h3>
                      <p className="mt-1 break-all text-sm font-bold text-[#4338ca]">https://go.prntd.ca/{qr.slug}</p>
                      <input
                        defaultValue={qr.destination_url}
                        onBlur={(event) => {
                          if (event.target.value !== qr.destination_url) void updateQr(qr, event.target.value);
                        }}
                        className="portal-field mt-3"
                      />
                      <p className="mt-2 text-sm text-[#6b7280]">
                        {qr.monthly_scans ?? 0} monthly scans • {qr.url_health ?? "unknown"}
                      </p>
                    </div>
                    <div className="grid content-start gap-2">
                      <button type="button" onClick={() => navigator.clipboard.writeText(`https://go.prntd.ca/${qr.slug}`)} className="portal-action">
                        Copy Link
                      </button>
                      <button type="button" onClick={() => void deleteQr(qr)} className="rounded-2xl border border-red-500/15 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
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
    </main>
  );
}
