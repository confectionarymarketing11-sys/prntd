import Link from "next/link";

import ProductMockup from "@/components/ProductMockup";

import {
  formatMoney,
  shopProducts,
} from "@/data/shop";

import {
  getPublishedReviewSummary,
} from "@/features/reviews/data/reviews";

export default async function ProductCatalog() {
  const reviewSummary =
    await getPublishedReviewSummary();

  return (
    <section className="relative overflow-hidden bg-[#020617] px-5 py-[70px] pb-[110px] text-white">
      {/* BG */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[#4f46e5]/15 blur-[140px]" />

        <div className="absolute bottom-[-10%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[#2563eb]/15 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1450px]">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#1e1b4b_100%)] p-8 shadow-[0_25px_90px_rgba(0,0,0,0.45)] sm:p-10">
          <div className="absolute right-[-10%] top-[-20%] h-[300px] w-[300px] rounded-full bg-[#6366f1]/20 blur-[100px]" />

          <div className="relative z-10 text-center">
            <div className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-5 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#c7d2fe]">
              Premium Print Products
            </div>

            <h1 className="mt-7 text-[clamp(50px,6vw,86px)] font-black leading-[0.92] tracking-[-0.07em]">
              Product
              <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                Showcase
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-[820px] text-lg leading-9 text-[#cbd5e1]">
              Discover apparel,
              stickers, labels, paper
              goods, and premium print
              products customized with
              PRNTD creative tools and
              AI-powered workflows.
            </p>
          </div>
        </div>

        {/* GRID */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {shopProducts.map((product) => {
            const summary =
              reviewSummary.get(
                product.id,
              ) ??
              reviewSummary.get("all");

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0f172a]/80 text-white no-underline shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20"
              >
                {/* GLOW */}
                <div className="absolute right-[-20%] top-[-20%] h-[220px] w-[220px] rounded-full bg-[#6366f1]/10 blur-[90px] transition group-hover:bg-[#6366f1]/20" />

                <div className="relative z-10">
                  <ProductMockup
                    product={product}
                  />

                  <div className="flex min-h-[340px] flex-col gap-5 p-7">
                    <div>
                      {/* TOP */}
                      <div className="flex items-center justify-between gap-3">
                        <p className="rounded-full border border-[#6366f1]/20 bg-[#6366f1]/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#c7d2fe]">
                          {product.category}
                        </p>

                        <p className="text-xl font-black text-white">
                          {formatMoney(
                            product.basePrice,
                          )}
                          +
                        </p>
                      </div>

                      {/* TITLE */}
                      <h2 className="mt-6 text-[30px] font-black leading-[1.05] tracking-[-0.04em] text-white">
                        {product.name}
                      </h2>

                      {/* REVIEWS */}
                      {summary ? (
                        <p className="mt-3 text-sm font-black text-[#818cf8]">
                          {summary.average.toFixed(
                            1,
                          )}
                          /5 from{" "}
                          {summary.count}{" "}
                          review
                          {summary.count === 1
                            ? ""
                            : "s"}
                        </p>
                      ) : null}

                      {/* DESC */}
                      <p className="mt-4 text-[15px] leading-8 text-[#cbd5e1]">
                        {
                          product.description
                        }
                      </p>
                    </div>

                    {/* BOTTOM */}
                    <div className="mt-auto grid gap-5">
                      {/* COLORS */}
                      {product.id !==
                        "die-cut-stickers" &&
                      product.id !==
                        "business-cards" ? (
                        <div>
                          <p className="mb-3 text-xs font-black uppercase tracking-[0.08em] text-[#94a3b8]">
                            Colors
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {product.colors.map(
                              (color) => (
                                <span
                                  key={
                                    color.name
                                  }
                                  className="h-7 w-7 rounded-full border border-white/10 shadow-[0_0_0_2px_rgba(255,255,255,0.04)]"
                                  style={{
                                    background:
                                      color.value,
                                  }}
                                  title={
                                    color.name
                                  }
                                />
                              ),
                            )}
                          </div>
                        </div>
                      ) : null}

                      {/* META */}
                      <div className="grid grid-cols-2 gap-3 text-xs font-black uppercase tracking-[0.08em]">
                        <span className="rounded-2xl border border-white/10 bg-[#020617] px-3 py-3 text-center text-[#cbd5e1]">
                          {
                            product.productionDays
                          }
                        </span>

                        <span className="rounded-2xl border border-white/10 bg-[#020617] px-3 py-3 text-center text-[#cbd5e1]">
                          Min{" "}
                          {
                            product.minimumQuantity
                          }
                        </span>
                      </div>

                      {/* CTA */}
                      <span className="inline-flex items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_40px_rgba(99,102,241,0.35)] transition group-hover:scale-[1.02]">
                        View Product
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}