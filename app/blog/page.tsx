
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Print Guides | PRNTD",
  description:
    "Learn about custom apparel, stickers, business cards, DTF printing, design tips, and print industry best practices.",
};

const articles = [
  {
    title:
      "DTF vs Screen Printing: Which Is Better for Custom Apparel in 2026?",
    description:
      "Compare DTF and screen printing to determine the best option for durability, color quality, cost, and order size.",
    href: "/blog/dtf-vs-screen-printing",
    category: "Apparel Printing",
  },

{
  title: "How to Design a Business Card That Gets Calls and Clients",
  description:
    "Learn how to create professional business cards that build trust and generate more leads.",
  href: "/blog/how-to-design-a-business-card-that-gets-calls-and-clients",
  category: "Business Cards",
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
        <section className="border-b border-white/10">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#c7d2fe]">
              PRNTD Knowledge Base
            </div>

            <h1 className="mt-8 text-[clamp(42px,8vw,88px)] font-black leading-[0.95] tracking-[-0.06em]">
              Print
              <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                Guides
              </span>
            </h1>

            <p className="mt-8 max-w-3xl text-xl leading-9 text-[#cbd5e1]">
              Learn how to get better results from custom apparel, stickers,
              business cards, and professional printing. Built for creators,
              businesses, and growing brands.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
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

          <div className="mt-16 rounded-[36px] border border-[#6366f1]/20 bg-[linear-gradient(135deg,rgba(99,102,241,.12),rgba(59,130,246,.12))] p-10 text-center">
            <h2 className="text-4xl font-black tracking-tight">
              Need Custom Printing?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-[#cbd5e1]">
              Design apparel, stickers, and business cards directly with
              PRNTD's online tools.
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
```
