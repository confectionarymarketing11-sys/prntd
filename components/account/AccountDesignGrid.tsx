"use client";

import { useState } from "react";
import type { AccountDesign } from "@/lib/account/customer-data";
import { usePrntdAccount } from "@/hooks/usePrntdAccount";
import { downloadUrl } from "@/lib/prntdClient";

type AccountDesignGridProps = {
  initialDesigns: AccountDesign[];
};

export default function AccountDesignGrid({ initialDesigns }: AccountDesignGridProps) {
  const { token, loadAccount } = usePrntdAccount();
  const [designs, setDesigns] = useState(initialDesigns);
  const [status, setStatus] = useState("");

  function applyDesign(design: AccountDesign) {
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

  async function deleteDesign(design: AccountDesign) {
    if (!window.confirm("Delete this design?")) return;

    try {
      const session = token ? { token } : await loadAccount();
      if (!session?.token) throw new Error("Sign in to delete designs.");

      const response = await fetch("/api/prntd/delete-design", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ path: design.path }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) throw new Error(data.error ?? "Delete failed.");

      setDesigns((current) => current.filter((item) => item.path !== design.path));
      setStatus("Design deleted.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Delete failed.");
    }
  }

  if (!designs.length) {
    return (
      <section className="rounded-[28px] border border-white/70 bg-white p-8 text-center shadow-[0_10px_28px_rgba(0,0,0,0.045)]">
        <p className="text-lg font-black">No saved designs found.</p>
        <p className="mt-2 text-[#6b7280]">Create a design with the Design Creator and it will appear here automatically.</p>
      </section>
    );
  }

  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {status && <p className="md:col-span-2 xl:col-span-3 text-sm font-semibold text-[#6b7280]">{status}</p>}
      {designs.map((design) => (
        <article key={design.path} className="rounded-[28px] border border-white/70 bg-white p-4 shadow-[0_10px_28px_rgba(0,0,0,0.045)]">
          <div className="rounded-3xl bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%),linear-gradient(-45deg,#e5e7eb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e7eb_75%),linear-gradient(-45deg,transparent_75%,#e5e7eb_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0px] p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={design.url} alt={design.prompt || "Saved design"} className="aspect-square w-full rounded-2xl object-contain" />
          </div>
          <h2 className="mt-4 text-lg font-black">{design.product_type || "Saved Design"}</h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6b7280]">{design.prompt || "No prompt saved."}</p>
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
        </article>
      ))}
    </section>
  );
}
