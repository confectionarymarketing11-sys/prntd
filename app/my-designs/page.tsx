"use client";

import { useCallback, useEffect, useState } from "react";
import AccountConnect from "@/components/AccountConnect";
import PortalSidebar from "@/components/PortalSidebar";
import ShopHeader from "@/components/ShopHeader";
import { downloadUrl, fetchDesigns, getStoredEmail, getTokenOrCreate, SavedDesign } from "@/lib/prntdClient";

export default function MyDesignsPage() {
  const [email, setEmail] = useState(getStoredEmail);
  const [status, setStatus] = useState("");
  const [designs, setDesigns] = useState<SavedDesign[]>([]);

  const loadDesigns = useCallback(async () => {
    if (!email.trim()) {
      setStatus("Enter your account email to view saved designs.");
      return;
    }

    setStatus("Loading your designs...");

    try {
      const token = await getTokenOrCreate(email);
      const data = await fetchDesigns(token);

      if (data.error) throw new Error(data.error);

      setDesigns(data.designs ?? []);
      setStatus(data.designs?.length ? "Designs loaded." : "No designs yet.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to load designs.");
    }
  }, [email]);

  useEffect(() => {
    if (!email) return;
    const timer = window.setTimeout(() => {
      void loadDesigns();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [email, loadDesigns]);

  async function deleteDesign(design: SavedDesign) {
    if (!window.confirm("Delete this design?")) return;

    try {
      const token = await getTokenOrCreate(email);
      const response = await fetch("/api/prntd/delete-design", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ path: design.path }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) throw new Error(data.error ?? "Delete failed.");

      setDesigns((current) => current.filter((item) => item.path !== design.path));
      setStatus("Design deleted.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Delete failed.");
    }
  }

  function applyDesign(design: SavedDesign) {
    localStorage.setItem(
      "prntd_design",
      JSON.stringify({
        image: design.url,
        designPath: design.path,
        type: "saved-design",
      })
    );
    localStorage.setItem("prntd_generated_image", design.url);

    if (design.product_type?.includes("shirt") || design.product_type?.includes("apparel")) {
      window.location.href = "/designer";
      return;
    }

    window.location.href = "/products";
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <ShopHeader />
      <div className="mx-auto flex max-w-[1400px] gap-[30px] px-5 py-10 max-[900px]:flex-col">
        <PortalSidebar />

        <section className="min-w-0 flex-1">
          <div className="mb-6">
            <h1 className="text-[clamp(42px,5vw,70px)] font-extrabold leading-[1.02] tracking-normal">Saved Designs</h1>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-[#6b7280]">
              Download, reuse, edit, or apply generated designs to print products.
            </p>
          </div>

          <AccountConnect email={email} setEmail={setEmail} onConnect={loadDesigns} status={status} />

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {designs.map((design) => (
              <article key={design.path} className="prntd-glass overflow-hidden p-4">
                <div className="rounded-3xl bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%),linear-gradient(-45deg,#e5e7eb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e7eb_75%),linear-gradient(-45deg,transparent_75%,#e5e7eb_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0px] p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={design.url} alt={design.prompt || "Saved design"} className="aspect-square w-full rounded-2xl object-contain" />
                </div>
                <div className="p-2">
                  <h2 className="mt-3 text-lg font-black">{design.product_type || "Generated Design"}</h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#6b7280]">{design.prompt || "No prompt saved."}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => downloadUrl(design.url, `design-${Date.now()}.png`)} className="portal-action">
                      Download
                    </button>
                    <button type="button" onClick={() => applyDesign(design)} className="portal-action">
                      Order
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem("prntd_edit_design", JSON.stringify({ image: design.url, path: design.path }));
                        window.location.href = "/edit-design";
                      }}
                      className="portal-action"
                    >
                      Edit
                    </button>
                    <button type="button" onClick={() => void deleteDesign(design)} className="rounded-2xl border border-red-500/15 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {designs.length === 0 && (
            <div className="prntd-glass mt-6 p-8 text-center">
              <p className="text-lg font-bold">No saved designs loaded.</p>
              <p className="mt-2 text-[#6b7280]">Create one from the design generator or connect your account.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
