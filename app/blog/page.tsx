import type { Metadata } from "next";
import Link from "next/link";
import ShopHeader from "@/components/ShopHeader";

export const metadata: Metadata = {
  title: "Print Guides | PRNTD",
  description:
    "Expert guides covering DTF printing, custom apparel, stickers, business cards, branding, and professional print design.",
};

const featuredArticle = {
  title: "DTF vs Screen Printing: Which Printing Method Is Better in 2026?",
  description:
    "Compare DTF and screen printing for cost, durability, print quality, fabric compatibility, and turnaround time.",
  href: "/blog/dtf-vs-screen-printing",
};

const articles = [
  {
    title:
      "DTF vs Screen Printing: Which Printing Method Is Better in 2026?",
    description:
      "Compare DTF and screen printing to determine the best option for quality, durability, cost, and order quantity.",
    href: "/blog/dtf-vs-screen-printing",
    category: "Apparel Printing",
  },
  {
    title:
      "How to Design a Business Card That Gets Calls, Clients & Sales",
    description:
      "Learn how to create business cards that build trust, improve brand recognition, and generate more leads.",
    href: "/blog/how-to-design-a-business-card-that-gets-calls-and-clients",
    category: "Business Cards",
  },
  {
    title: "DTF vs DTG Printing: What's the Difference?",
    description:
      "Learn the key differences between DTF and DTG printing, including quality, cost, and ideal use cases.",
    href: "/blog/dtf-vs-dtg",
    category: "Apparel Printing",
  },
  {
    title: "Gloss vs Matte Business Cards",
    description:
      "Discover the pros and cons of gloss and matte business cards and which finish is right for your brand.",
    href: "/blog/gloss-vs-matte-business-cards",
    category: "Business Cards",
  },
  {
    title: "Best Sticker Materials for Outdoor Use",
    description:
      "Compare vinyl, waterproof, laminated, and weather-resistant sticker materials.",
    href: "/blog/best-sticker-materials-for-outdoor-use",
    category: "Stickers",
  },
];

const categories = [
  {
    title: "Apparel Printing",
    description: "DTF, DTG, screen printing, and custom apparel guides.",
  },
  {
    title: "Business Cards",
    description: "Design tips, finishes, layouts, and marketing advice.",
  },
  {
    title: "Custom Stickers",
    description: "Materials, durability, sizing, and application tips.",
  },
  {
    title: "Design Tips",
    description: "Branding, artwork setup, and professional design advice.",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[#4f46e5]/15 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[#2563eb]/15 blur-[140px]" />
      </div>

      <div className="relative z-10">
        <ShopHeader />

        <section className="border-b border-white/10">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#c7d2fe]">
              PRNTD Knowledge Base
            </div>

            <h1 className="mt-8 text-[clamp(48px,8vw,92px)] font-black leading-[0.95] tracking-[-0.06em]">
              Print
              <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                Guides
              </span>
            </h1>

            <p className="mt-8 max-w-3xl text-xl leading-9 text-[#cbd5e1]">
              Learn about custom apparel, stickers, business cards, DTF
              printing, branding, marketing, and professional design.
              Built for creators, businesses, entrepreneurs, and growing
              brands.
            </p>

            <div className="mt-12 grid gap-4 md:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-[#94a3b8]">Category</p>
                <h3 className="mt-2 text-xl font-black">
                  Apparel Printing
                </h3>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-[#94a3b8]">Category</p>
                <h3 className="mt-2 text-xl font-black">
                  Business Cards
                </h3>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-[#94a3b8]">Category</p>
                <h3 className="mt-2 text-xl font-black">
                  Custom Stickers
                </h3>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-[#94a3b8]">Category</p>
                <h3 className="mt-2 text-xl font-black">
                  Design Tips
                </h3>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pt-12">
          <Link
            href={featuredArticle.href}
            className="group block overflow-hidden rounded-[40px] border border-[#6366f1]/20 bg-[linear-gradient(135deg,rgba(99,102,241,.12),rgba(59,130,246,.12))] p-10 transition-all duration-300 hover:border-[#6366f1]/40"
          >
            <div className="inline-flex rounded-full border border-[#6366f1]/20 bg-[#6366f1]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#c7d2fe]">
              Featured Guide
            </div>

            <h2 className="mt-8 text-5xl font-black tracking-tight md:text-6xl">
              {featuredArticle.title}
            </h2>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#cbd5e1]">
              {featuredArticle.description}
            </p>

            <div className="mt-8 flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[#93c5fd]">
              Read Featured Article
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-10">
            <h2 className="text-4xl font-black tracking-tight">
              Browse Categories
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => (
              <div
                key={category.title}
                className="rounded-[28px] border border-white/10 bg-[#0f172a]/80 p-6 backdrop-blur-xl"
              >
                <h3 className="text-xl font-black">
                  {category.title}
                </h3>

                <p className="mt-3 text-[#cbd5e1]">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="mb-10">
            <h2 className="text-4xl font-black tracking-tight">
              Latest Articles
            </h2>
          </div>

          <div className="grid gap-8">
            {articles.map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className="group rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-8 backdrop-blur-xl transition-all duration-300 hover:border-[#6366f1]/30 hover:bg-[#111c33]"
              >
                <div className="mb-5 inline-flex rounded-full border border-[#6366f1]/20 bg-[#6366f1]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#c7d2fe]">
                  {article.category}
                </div>

                <h2 className="text-3xl font-black tracking-tight transition group-hover:text-[#c7d2fe]">
                  {article.title}
                </h2>

                <p className="mt-4 max-w-3xl text-lg leading-8 text-[#cbd5e1]">
                  {article.description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-[#93c5fd]">
                  Read Article
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="rounded-[36px] border border-white/10 bg-[#0f172a]/80 p-10">
            <h2 className="text-4xl font-black tracking-tight">
              Why Read PRNTD Print Guides?
            </h2>

            <p className="mt-6 text-lg leading-8 text-[#cbd5e1]">
              Printing technology changes quickly. Our guides help
              businesses, creators, and brands make informed decisions
              about custom apparel, stickers, business cards, and
              promotional products. Whether you're comparing printing
              methods, choosing materials, or designing marketing
              collateral, PRNTD provides practical information designed
              to help you achieve better results.
            </p>

            <p className="mt-6 text-lg leading-8 text-[#cbd5e1]">
              Explore detailed comparisons, buying guides, design
              tutorials, and professional printing advice from a team
              passionate about helping brands stand out.
            </p>
          </div>

          <div className="mt-16 rounded-[36px] border border-[#6366f1]/20 bg-[linear-gradient(135deg,rgba(99,102,241,.12),rgba(59,130,246,.12))] p-10 text-center">
            <h2 className="text-4xl font-black tracking-tight">
              Ready to Create Something Amazing?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-[#cbd5e1]">
              Design custom apparel, business cards, stickers, and more
              with PRNTD's online design tools.
            </p>

            <Link
              href="/designer"
              className="mt-8 inline-flex rounded-2xl bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] px-8 py-4 font-black text-white shadow-[0_12px_40px_rgba(99,102,241,0.35)]"
            >
              Start Designing
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}