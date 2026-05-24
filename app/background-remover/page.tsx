"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Download,
  ImagePlus,
  RefreshCw,
  Scissors,
  ShieldCheck,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";

import PortalSidebar from "@/components/PortalSidebar";
import ShopHeader from "@/components/ShopHeader";

import { usePrntdAccount } from "@/hooks/usePrntdAccount";

import { fetchCredits } from "@/lib/prntdClient";

export default function BackgroundRemoverPage() {
  const {
    email: accountEmail,
    token: accountToken,
    status: accountStatus,
    loadAccount:
      loadPrntdAccount,
  } = usePrntdAccount();

  const [status, setStatus] =
    useState("");

  const [credits, setCredits] =
    useState(
      "Credits: --",
    );

  const [
    selectedFile,
    setSelectedFile,
  ] =
    useState<File | null>(
      null,
    );

  const [previewUrl, setPreviewUrl] =
    useState("");

  const [resultUrl, setResultUrl] =
    useState("");

  const [progress, setProgress] =
    useState(0);

  const [processing, setProcessing] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const progressInterval =
    useRef<number | null>(
      null,
    );

  const loadAccount =
    useCallback(async () => {
      const session =
        accountToken
          ? {
              token:
                accountToken,
            }
          : await loadPrntdAccount();

      if (!session?.token)
        return;

      try {
        const data =
          await fetchCredits(
            session.token,
          );

        setCredits(
          `Credits: ${
            data.total_credits ??
            "--"
          }`,
        );

        setStatus(
          "Account synced.",
        );
      } catch (error) {
        setStatus(
          error instanceof Error
            ? error.message
            : "Unable to sync account.",
        );
      }
    }, [
      accountToken,
      loadPrntdAccount,
    ]);

  useEffect(() => {
    if (!accountToken)
      return;

    const timer =
      window.setTimeout(() => {
        void loadAccount();
      }, 0);

    return () =>
      window.clearTimeout(timer);
  }, [
    accountToken,
    loadAccount,
  ]);

  function setFile(
    file: File | null,
  ) {
    if (!file) return;

    setSelectedFile(file);

    setPreviewUrl(
      URL.createObjectURL(
        file,
      ),
    );

    setResultUrl("");

    setStatus(
      `${file.name} ready.`,
    );
  }

  function startProgress() {
    let nextProgress = 0;

    setProgress(0);

    if (
      progressInterval.current
    ) {
      window.clearInterval(
        progressInterval.current,
      );
    }

    progressInterval.current =
      window.setInterval(() => {
        if (
          nextProgress >= 95
        )
          return;

        nextProgress =
          Math.min(
            95,
            nextProgress +
              Math.random() *
                14,
          );

        setProgress(
          Math.floor(
            nextProgress,
          ),
        );
      }, 250);
  }

  async function runRemoval() {
    if (!selectedFile) {
      setStatus(
        "Choose an image first.",
      );

      return;
    }

    const session =
      accountToken
        ? {
            token:
              accountToken,
          }
        : await loadPrntdAccount();

    if (!session?.token) {
      setStatus(
        "Sign in to remove backgrounds.",
      );

      return;
    }

    const token =
      session.token;

    setProcessing(true);

    setStatus(
      "Removing background...",
    );

    startProgress();

    try {
      const formData =
        new FormData();

      formData.append(
        "image",
        selectedFile,
      );

      const response =
        await fetch(
          "/api/prntd/remove-bg",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          },
        );

      if (!response.ok) {
        const data =
          (await response
            .json()
            .catch(() => ({}))) as {
            error?: string;
          };

        throw new Error(
          data.error ??
            "Background removal failed.",
        );
      }

      if (
        progressInterval.current
      ) {
        window.clearInterval(
          progressInterval.current,
        );
      }

      setProgress(100);

      const blob =
        await response.blob();

      const url =
        URL.createObjectURL(
          blob,
        );

      setResultUrl(url);

      setStatus(
        "Background removed. Download started.",
      );

      const anchor =
        document.createElement(
          "a",
        );

      anchor.href = url;

      anchor.download = `prntd-bg-removed-${Date.now()}.png`;

      document.body.appendChild(
        anchor,
      );

      anchor.click();

      anchor.remove();

      const data =
        await fetchCredits(
          token,
        );

      setCredits(
        `Credits: ${
          data.total_credits ??
          "--"
        }`,
      );
    } catch (error) {
      if (
        progressInterval.current
      ) {
        window.clearInterval(
          progressInterval.current,
        );
      }

      setStatus(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );
    } finally {
      setProcessing(false);

      window.setTimeout(
        () =>
          setProgress(0),
        700,
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
                    AI Image Processing
                  </div>

                  <h1 className="mt-7 text-[clamp(52px,6vw,92px)] font-black leading-[0.92] tracking-[-0.06em]">
                    Background
                    <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                      Remover
                    </span>
                  </h1>

                  <p className="mt-6 max-w-3xl text-lg leading-9 text-[#cbd5e1]">
                    Instantly remove
                    backgrounds for
                    ecommerce,
                    apparel,
                    stickers,
                    menus, product
                    photography,
                    and print-ready
                    graphics.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void loadAccount()
                  }
                  className="inline-flex items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] px-7 py-4 text-sm font-black text-white shadow-[0_20px_60px_rgba(99,102,241,0.35)] transition hover:-translate-y-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Credits
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
                    {accountEmail ||
                      "Loading..."}
                  </p>

                  <p className="mt-2 text-sm text-[#94a3b8]">
                    {status ||
                      accountStatus}
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-[#0f172a]/80 px-6 py-5">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                    Available Credits
                  </p>

                  <p className="mt-3 text-[44px] font-black leading-none">
                    {credits.replace(
                      "Credits: ",
                      "",
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* MAIN */}
            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
              {/* DROPZONE */}
              <section
                role="button"
                tabIndex={0}
                onClick={() =>
                  fileInputRef.current?.click()
                }
                onDragOver={(
                  event,
                ) =>
                  event.preventDefault()
                }
                onDrop={(
                  event,
                ) => {
                  event.preventDefault();

                  setFile(
                    event
                      .dataTransfer
                      .files[0] ??
                      null,
                  );
                }}
                className="group relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl transition duration-300 hover:border-[#6366f1]/30 hover:bg-white/[0.05]"
              >
                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(
                    event,
                  ) =>
                    setFile(
                      event
                        .target
                        .files?.[0] ??
                        null,
                    )
                  }
                />

                {!previewUrl ? (
                  <div className="flex min-h-[560px] flex-col items-center justify-center text-center">
                    <div className="grid h-28 w-28 place-items-center rounded-[32px] bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] shadow-[0_20px_60px_rgba(99,102,241,0.35)]">
                      <Upload className="h-12 w-12 text-white" />
                    </div>

                    <h2 className="mt-8 text-5xl font-black tracking-[-0.05em]">
                      Drop Your
                      Image
                    </h2>

                    <p className="mt-5 max-w-xl text-lg leading-9 text-[#cbd5e1]">
                      PNG, JPG, or
                      WebP. Click to
                      upload or drag
                      your image into
                      the workspace.
                    </p>
                  </div>
                ) : (
                  <div className="flex min-h-[560px] items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        previewUrl
                      }
                      alt="Selected image"
                      className="max-h-[520px] max-w-full rounded-[32px] object-contain shadow-[0_25px_90px_rgba(0,0,0,0.35)]"
                    />
                  </div>
                )}
              </section>

              {/* SIDEBAR */}
              <aside className="overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,#111827_0%,#1e1b4b_100%)] p-7 shadow-[0_35px_120px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#c7d2fe]">
                      AI Processing
                    </p>

                    <h2 className="mt-4 text-[46px] font-black leading-[0.95] tracking-[-0.04em]">
                      Remove
                      <span className="block text-[#a5b4fc]">
                        Backgrounds
                      </span>
                    </h2>
                  </div>

                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] shadow-[0_15px_50px_rgba(99,102,241,0.35)]">
                    <Scissors className="h-7 w-7 text-white" />
                  </div>
                </div>

                <div className="mt-7 rounded-[28px] border border-white/10 bg-white/[0.05] p-6">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-[#22c55e]" />

                    <p className="text-sm font-black">
                      Professional
                      Quality
                    </p>
                  </div>

                  <p className="mt-4 text-[15px] leading-8 text-[#cbd5e1]">
                    Optimized for
                    print products,
                    apparel mockups,
                    product photos,
                    ecommerce, and
                    transparent PNG
                    exports.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    runRemoval
                  }
                  disabled={
                    processing ||
                    !selectedFile
                  }
                  className="mt-7 flex w-full items-center justify-center gap-3 rounded-[24px] bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] px-7 py-5 text-lg font-black text-white shadow-[0_20px_60px_rgba(99,102,241,0.35)] transition hover:-translate-y-1 disabled:opacity-50"
                >
                  <Wand2 className="h-5 w-5" />

                  {processing
                    ? "Removing..."
                    : "Remove Background"}
                </button>

                <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black">
                      Processing
                    </p>

                    <p className="text-sm font-bold text-[#94a3b8]">
                      {progress}%
                    </p>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] transition-all"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  <p className="mt-4 text-sm leading-7 text-[#94a3b8]">
                    Uses 2 credits
                    per image.
                    Processed images
                    automatically
                    download as PNG.
                  </p>
                </div>

                {/* RESULT */}
                {resultUrl && (
                  <div className="mt-6">
                    <div className="mb-4 flex items-center gap-2">
                      <ImagePlus className="h-5 w-5 text-[#818cf8]" />

                      <p className="text-sm font-black">
                        Processed
                        Result
                      </p>
                    </div>

                    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          resultUrl
                        }
                        alt="Result"
                        className="w-full rounded-[20px]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const anchor =
                          document.createElement(
                            "a",
                          );

                        anchor.href =
                          resultUrl;

                        anchor.download = `prntd-bg-removed-${Date.now()}.png`;

                        document.body.appendChild(
                          anchor,
                        );

                        anchor.click();

                        anchor.remove();
                      }}
                      className="mt-5 flex w-full items-center justify-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] px-6 py-5 text-sm font-black text-white transition hover:bg-white/[0.08]"
                    >
                      <Download className="h-4 w-4" />
                      Download PNG
                    </button>
                  </div>
                )}
              </aside>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}