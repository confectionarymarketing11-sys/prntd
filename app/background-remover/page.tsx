"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AccountConnect from "@/components/AccountConnect";
import PortalSidebar from "@/components/PortalSidebar";
import ShopHeader from "@/components/ShopHeader";
import { fetchCredits, getStoredEmail, getTokenOrCreate } from "@/lib/prntdClient";

export default function BackgroundRemoverPage() {
  const [email, setEmail] = useState(getStoredEmail);
  const [status, setStatus] = useState("");
  const [credits, setCredits] = useState("Credits: --");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const progressInterval = useRef<number | null>(null);

  const loadAccount = useCallback(async () => {
    if (!email.trim()) {
      setStatus("Enter your account email to load credits.");
      return;
    }

    try {
      const token = await getTokenOrCreate(email);
      const data = await fetchCredits(token);
      setCredits(`Credits: ${data.total_credits ?? "--"}`);
      setStatus("Account connected.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to connect account.");
    }
  }, [email]);

  useEffect(() => {
    if (!email) return;
    const timer = window.setTimeout(() => {
      void loadAccount();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [email, loadAccount]);

  function setFile(file: File | null) {
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResultUrl("");
    setStatus(`${file.name} ready.`);
  }

  function startProgress() {
    let nextProgress = 0;
    setProgress(0);

    if (progressInterval.current) window.clearInterval(progressInterval.current);

    progressInterval.current = window.setInterval(() => {
      if (nextProgress >= 95) return;

      nextProgress = Math.min(95, nextProgress + Math.random() * 14);
      setProgress(Math.floor(nextProgress));
    }, 250);
  }

  async function runRemoval() {
    if (!selectedFile) {
      setStatus("Choose an image first.");
      return;
    }

    let token = "";

    try {
      token = await getTokenOrCreate(email);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to authenticate.");
      return;
    }

    setProcessing(true);
    setStatus("Removing background...");
    startProgress();

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/prntd/remove-bg", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Background removal failed.");
      }

      if (progressInterval.current) window.clearInterval(progressInterval.current);
      setProgress(100);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setStatus("Background removed. Download started.");

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `prntd-bg-removed-${Date.now()}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      const data = await fetchCredits(token);
      setCredits(`Credits: ${data.total_credits ?? "--"}`);
    } catch (error) {
      if (progressInterval.current) window.clearInterval(progressInterval.current);
      setStatus(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setProcessing(false);
      window.setTimeout(() => setProgress(0), 700);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <ShopHeader />
      <div className="mx-auto flex max-w-[1400px] gap-[30px] px-5 py-10 max-[900px]:flex-col">
        <PortalSidebar />

        <section className="min-w-0 flex-1">
          <div className="mb-6 text-center">
            <h1 className="text-[clamp(42px,5vw,70px)] font-extrabold leading-[1.02] tracking-normal">
              Remove Image Backgrounds
            </h1>
            <p className="mx-auto mt-4 max-w-[760px] text-lg leading-8 text-[#6b7280]">
              Clean product images instantly for apparel, menus, product photography, and ecommerce use.
            </p>
          </div>

          <AccountConnect email={email} setEmail={setEmail} onConnect={loadAccount} status={`${credits} • ${status}`} />

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            <section
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                setFile(event.dataTransfer.files[0] ?? null);
              }}
              className="prntd-glass flex min-h-[460px] cursor-pointer flex-col items-center justify-center p-8 text-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Selected image" className="max-h-[360px] max-w-full rounded-3xl object-contain shadow-[0_12px_38px_rgba(0,0,0,0.08)]" />
              ) : (
                <>
                  <p className="text-3xl font-black">Drop an image here</p>
                  <p className="mt-3 max-w-md text-[#6b7280]">PNG, JPG, or WebP. Click this panel to choose a file.</p>
                </>
              )}
            </section>

            <aside className="prntd-glass p-7">
              <h2 className="text-3xl font-black tracking-normal">Background Remover</h2>
              <p className="mt-2 text-sm leading-6 text-[#6b7280]">Uses 2 credits per image. Results download automatically.</p>

              <button type="button" onClick={runRemoval} disabled={processing || !selectedFile} className="design-main-btn">
                {processing ? "Removing..." : "Remove Background"}
              </button>

              {progress > 0 && (
                <div className="mt-5">
                  <div className="h-3 overflow-hidden rounded-full bg-[#e5e7eb]">
                    <div className="h-full prntd-premium-gradient transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-3 text-center text-sm text-[#6b7280]">Processing image...</p>
                </div>
              )}

              {resultUrl && (
                <div className="mt-6">
                  <p className="mb-3 text-sm font-bold text-[#6b7280]">Result</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resultUrl} alt="Background removed result" className="w-full rounded-3xl bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)]" />
                </div>
              )}
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
