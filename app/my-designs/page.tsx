"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Download,
  Pencil,
  RefreshCw,
  ShoppingBag,
  Trash2,
  Sparkles,
  FolderOpen,
} from "lucide-react";

import PortalSidebar from "@/components/PortalSidebar";
import ShopHeader from "@/components/ShopHeader";
import { usePrntdAccount } from "@/hooks/usePrntdAccount";
import {
  downloadUrl,
  fetchDesigns,
  SavedDesign,
} from "@/lib/prntdClient";

export default function MyDesignsPage() {
  const {
    email,
    token,
    status: accountStatus,
    loadAccount,
  } = usePrntdAccount();

  const [status, setStatus] =
    useState("");

  const [designs, setDesigns] =
    useState<SavedDesign[]>([]);

  const loadDesigns =
    useCallback(async () => {
      const session = token
        ? { token }
        : await loadAccount();

      if (!session?.token) {
        setStatus(
          "Sign in to view saved designs.",
        );

        return;
      }

      setStatus(
        "Loading your designs...",
      );

      try {
        const data =
          await fetchDesigns(
            session.token,
          );

        if (data.error) {
          throw new Error(
            data.error,
          );
        }

        setDesigns(
          data.designs ?? [],
        );

        setStatus(
          data.designs?.length
            ? "Designs loaded."
            : "No saved designs yet.",
        );
      } catch (error) {
        setStatus(
          error instanceof Error
            ? error.message
            : "Failed to load designs.",
        );
      }
    }, [token, loadAccount]);

  useEffect(() => {
    if (!token) return;

    const timer =
      window.setTimeout(() => {
        void loadDesigns();
      }, 0);

    return () =>
      window.clearTimeout(timer);
  }, [token, loadDesigns]);

  async function deleteDesign(
    design: SavedDesign,
  ) {
    if (
      !window.confirm(
        "Delete this design?",
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
          "/api/prntd/delete-design",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${session.token}`,
            },
            body: JSON.stringify({
              path: design.path,
            }),
          },
        );

      const data =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Delete failed.",
        );
      }

      setDesigns((current) =>
        current.filter(
          (item) =>
            item.path !==
            design.path,
        ),
      );

      setStatus(
        "Design deleted.",
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Delete failed.",
      );
    }
  }

  function applyDesign(
    design: SavedDesign,
  ) {
    localStorage.setItem(
      "prntd_design",
      JSON.stringify({
        image: design.url,
        designPath:
          design.path,
        type: "saved-design",
      }),
    );

    localStorage.setItem(
      "prntd_generated_image",
      design.url,
    );

    if (
      design.product_type?.includes(
        "shirt",
      ) ||
      design.product_type?.includes(
        "apparel",
      )
    ) {
      window.location.href =
        "/designer";

      return;
    }

    window.location.href =
      "/products";
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* BACKGROUND */}
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
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#c7d2fe] backdrop-blur">
                    <Sparkles className="h-4 w-4" />
                    PRNTD Design Vault
                  </div>

                  <h1 className="mt-7 text-[clamp(52px,6vw,92px)] font-black leading-[0.92] tracking-[-0.06em]">
                    Saved
                    <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                      Designs
                    </span>
                  </h1>

                  <p className="mt-6 max-w-3xl text-lg leading-9 text-[#cbd5e1]">
                    Download, edit,
                    reorder, or apply
                    your AI-generated
                    artwork directly to
                    products.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void loadDesigns()
                  }
                  className="inline-flex items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] px-7 py-4 text-sm font-black text-white shadow-[0_20px_60px_rgba(99,102,241,0.35)] transition hover:-translate-y-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Designs
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
                    Total Designs
                  </p>

                  <p className="mt-3 text-[44px] font-black leading-none">
                    {designs.length}
                  </p>
                </div>
              </div>
            </div>

            {/* GRID */}
            {designs.length > 0 ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {designs.map(
                  (design) => (
                    <article
                      key={
                        design.path
                      }
                      className="group overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-[#6366f1]/30 hover:shadow-[0_25px_70px_rgba(99,102,241,0.18)]"
                    >
                      {/* IMAGE */}
                      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0f172a]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            design.url
                          }
                          alt={
                            design.prompt ||
                            "Saved design"
                          }
                          className="aspect-square w-full object-contain transition duration-500 group-hover:scale-[1.03]"
                        />
                      </div>

                      {/* CONTENT */}
                      <div className="p-2">
                        <div className="mt-5 flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#818cf8]">
                              Saved Design
                            </p>

                            <h2 className="mt-2 text-xl font-black leading-tight">
                              {design.product_type ||
                                "Generated Artwork"}
                            </h2>
                          </div>
                        </div>

                        <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#cbd5e1]">
                          {design.prompt ||
                            "No prompt saved."}
                        </p>

                        {/* ACTIONS */}
                        <div className="mt-6 grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              downloadUrl(
                                design.url,
                                `design-${Date.now()}.png`,
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-black text-white transition hover:bg-white/[0.08]"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              applyDesign(
                                design,
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] px-4 py-4 text-sm font-black text-white shadow-[0_15px_40px_rgba(99,102,241,0.28)]"
                          >
                            <ShoppingBag className="h-4 w-4" />
                            Order
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              localStorage.setItem(
                                "prntd_edit_design",
                                JSON.stringify(
                                  {
                                    image:
                                      design.url,
                                    path: design.path,
                                  },
                                ),
                              );

                              window.location.href =
                                "/edit-design";
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-black text-white transition hover:bg-white/[0.08]"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void deleteDesign(
                                design,
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm font-black text-red-300 transition hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ),
                )}
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] p-12 text-center backdrop-blur-2xl shadow-[0_25px_90px_rgba(0,0,0,0.35)]">
                <div className="mx-auto grid h-24 w-24 place-items-center rounded-[28px] bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] shadow-[0_20px_60px_rgba(99,102,241,0.35)]">
                  <FolderOpen className="h-10 w-10 text-white" />
                </div>

                <h2 className="mt-8 text-4xl font-black tracking-[-0.04em]">
                  No Saved Designs
                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-lg leading-9 text-[#cbd5e1]">
                  Create artwork from the
                  AI design generator and
                  your saved designs will
                  appear here automatically.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href =
                      "/generate";
                  }}
                  className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] px-8 py-5 text-sm font-black text-white shadow-[0_20px_60px_rgba(99,102,241,0.35)] transition hover:-translate-y-1"
                >
                  Generate Designs
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}