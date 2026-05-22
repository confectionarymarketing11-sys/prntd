"use client";

import { useEffect, useRef, useState } from "react";
import AccountConnect from "@/components/AccountConnect";
import PortalSidebar from "@/components/PortalSidebar";
import ShopHeader from "@/components/ShopHeader";
import { downloadUrl, fetchCredits, getStoredEmail, getTokenOrCreate } from "@/lib/prntdClient";

export default function EditDesignPage() {
  const [email, setEmail] = useState(getStoredEmail);
  const [status, setStatus] = useState("");
  const [credits, setCredits] = useState("Credits: --");
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [request, setRequest] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem("prntd_edit_design");
      if (!saved) return;

      try {
        const parsed = JSON.parse(saved) as { image?: string };
        if (parsed.image) setPreviewUrl(parsed.image);
        localStorage.removeItem("prntd_edit_design");
      } catch {
        localStorage.removeItem("prntd_edit_design");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function connect() {
    try {
      const token = await getTokenOrCreate(email);
      const data = await fetchCredits(token);
      setCredits(`Credits: ${data.total_credits ?? "--"}`);
      setStatus("Account connected.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to connect account.");
    }
  }

  function setFile(file: File | null) {
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResultUrl("");
  }

  async function imageBlob() {
    if (selectedFile) return selectedFile;
    if (!previewUrl) throw new Error("Choose an image first.");

    const response = await fetch(previewUrl);
    return response.blob();
  }

  async function runEdit() {
    if (!request.trim()) {
      setStatus("Describe the edit first.");
      return;
    }

    setProcessing(true);
    setProgress(15);
    setStatus("Applying edit...");

    try {
      const token = await getTokenOrCreate(email);
      const blob = await imageBlob();
      const formData = new FormData();
      formData.append("image", blob, "design.png");
      formData.append("editRequest", request);
      setProgress(45);

      const response = await fetch("/api/prntd/edit-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = (await response.json()) as { imageUrl?: string; error?: string };

      if (!response.ok || !data.imageUrl) {
        throw new Error(data.error ?? "Edit failed.");
      }

      setProgress(100);
      setResultUrl(data.imageUrl);
      setPreviewUrl(data.imageUrl);
      setRequest("");
      setStatus("Edit complete. Download started.");
      downloadUrl(data.imageUrl, `edited-${Date.now()}.png`);

      const creditsData = await fetchCredits(token);
      setCredits(`Credits: ${creditsData.total_credits ?? "--"}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Edit failed.");
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
          <div className="mb-6">
            <h1 className="text-[clamp(42px,5vw,70px)] font-extrabold leading-[1.02] tracking-normal">Edit Image</h1>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-[#6b7280]">Upload or load a saved design, describe the change, and generate a new version.</p>
          </div>

          <AccountConnect email={email} setEmail={setEmail} onConnect={connect} status={`${credits} • ${status}`} />

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            <section
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              className="prntd-glass flex min-h-[460px] cursor-pointer items-center justify-center p-8 text-center"
            >
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Design to edit" className="max-h-[380px] max-w-full rounded-3xl object-contain shadow-[0_12px_38px_rgba(0,0,0,0.08)]" />
              ) : (
                <div>
                  <p className="text-3xl font-black">Choose an image</p>
                  <p className="mt-3 text-[#6b7280]">Click to upload a design for editing.</p>
                </div>
              )}
            </section>

            <aside className="prntd-glass p-7">
              <h2 className="text-3xl font-black">Edit Request</h2>
              <textarea
                value={request}
                onChange={(event) => setRequest(event.target.value)}
                className="portal-field mt-4 min-h-[160px]"
                placeholder="Example: Make the text larger and change the palette to black and gold."
              />
              <button type="button" disabled={processing} onClick={runEdit} className="design-main-btn">
                {processing ? "Applying Edit..." : "Apply Edit - 1 Credit"}
              </button>

              {progress > 0 && (
                <div className="mt-5">
                  <div className="h-3 overflow-hidden rounded-full bg-[#e5e7eb]">
                    <div className="h-full prntd-premium-gradient transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {resultUrl && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("prntd_generated_image", resultUrl);
                    window.location.href = "/designer";
                  }}
                  className="design-main-btn"
                >
                  Apply To Shirt
                </button>
              )}
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
