import type { Metadata } from "next";
import Link from "next/link";
import ShopHeader from "@/components/ShopHeader";

export const metadata: Metadata = {
  title:
    "Matte vs Glossy Business Cards: Which Finish Is Best in 2026? | PRNTD",
  description:
    "Compare matte and glossy business cards to find the best finish for your brand. Learn about durability, appearance, readability, cost, and professional use cases.",
};

export default function MatteVsGlossBusinessCardsPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[#4f46e5]/15 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[#2563eb]/15 blur-[140px]" />
      </div>

      <div className="relative z-10">
        <ShopHeader />

        <section className="border-b border-white/10 pt-16">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#c7d2fe]">
              Business Card Guide
            </div>

            <h1 className="mt-8 text-[clamp(48px,8vw,92px)] font-black leading-[0.95] tracking-[-0.06em]">
              Matte vs
              <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                Glossy Business Cards
              </span>
            </h1>

            <p className="mt-8 max-w-3xl text-xl leading-9 text-[#cbd5e1]">
              Choosing the right finish can dramatically impact how your
              business card looks, feels, and performs. This guide compares
              matte and glossy business cards to help you select the best
              option for your brand and industry.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/business-card-designer"
                className="rounded-2xl bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] px-8 py-4 font-black text-white shadow-[0_12px_40px_rgba(99,102,241,0.35)]"
              >
                Design Business Cards
              </Link>

              <Link
                href="/contact"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-4 font-black text-white"
              >
                Request Quote
              </Link>
            </div>
          </div>
        </section>

        <article className="mx-auto max-w-6xl px-6 py-16 space-y-10">

          <section className="rounded-[32px] border border-cyan-500/20 bg-cyan-500/10 p-8">
            <h2 className="text-3xl font-black">
              Quick Comparison
            </h2>

            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-4">Feature</th>
                    <th className="pb-4">Matte</th>
                    <th className="pb-4">Glossy</th>
                  </tr>
                </thead>

                <tbody className="text-[#cbd5e1]">
                  <tr className="border-b border-white/10">
                    <td className="py-4">Professional Appearance</td>
                    <td>🏆 Excellent</td>
                    <td>Very Good</td>
                  </tr>

                  <tr className="border-b border-white/10">
                    <td className="py-4">Color Vibrancy</td>
                    <td>Good</td>
                    <td>🏆 Excellent</td>
                  </tr>

                  <tr className="border-b border-white/10">
                    <td className="py-4">Write-On Surface</td>
                    <td>🏆 Excellent</td>
                    <td>Poor</td>
                  </tr>

                  <tr className="border-b border-white/10">
                    <td className="py-4">Photo Printing</td>
                    <td>Good</td>
                    <td>🏆 Excellent</td>
                  </tr>

                  <tr>
                    <td className="py-4">Luxury Feel</td>
                    <td>🏆 Excellent</td>
                    <td>Excellent</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-8">
            <h2 className="text-3xl font-black">
              What Are Matte Business Cards?
            </h2>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              Matte business cards feature a non-reflective finish that
              creates a smooth, sophisticated appearance. Unlike glossy
              cards, matte cards absorb light rather than reflecting it,
              producing a clean and modern look.
            </p>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              Many professionals prefer matte cards because they feel more
              premium, reduce glare, and provide a subtle elegance that
              works well across many industries.
            </p>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-8">
            <h2 className="text-3xl font-black">
              What Are Glossy Business Cards?
            </h2>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              Glossy business cards feature a reflective coating that makes
              colors appear brighter and more vibrant. This finish creates
              strong visual impact and is particularly effective for
              photography, colorful branding, and image-heavy designs.
            </p>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              The reflective surface helps graphics stand out and often
              creates a polished, energetic impression.
            </p>
          </section>

          <section className="rounded-[32px] border border-green-500/20 bg-green-500/10 p-8">
            <h2 className="text-3xl font-black">
              Advantages of Matte Business Cards
            </h2>

            <ul className="mt-6 space-y-4 text-lg text-[#cbd5e1]">
              <li>✓ Professional appearance</li>
              <li>✓ Easy to read under bright lighting</li>
              <li>✓ Premium modern aesthetic</li>
              <li>✓ Easier to write notes on</li>
              <li>✓ Fingerprints are less noticeable</li>
              <li>✓ Excellent for luxury brands</li>
            </ul>
          </section>

          <section className="rounded-[32px] border border-violet-500/20 bg-violet-500/10 p-8">
            <h2 className="text-3xl font-black">
              Advantages of Glossy Business Cards
            </h2>

            <ul className="mt-6 space-y-4 text-lg text-[#cbd5e1]">
              <li>✓ More vibrant colors</li>
              <li>✓ Excellent photo reproduction</li>
              <li>✓ Strong visual impact</li>
              <li>✓ Sharp graphic presentation</li>
              <li>✓ Great for image-heavy designs</li>
              <li>✓ Attractive shine and contrast</li>
            </ul>
          </section>

          <section className="rounded-[32px] border border-amber-500/20 bg-amber-500/10 p-8">
            <h2 className="text-3xl font-black">
              Which Industries Prefer Matte?
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                "Law Firms",
                "Consultants",
                "Financial Advisors",
                "Luxury Brands",
                "Architects",
                "Real Estate Professionals",
              ].map((industry) => (
                <div
                  key={industry}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  {industry}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-cyan-500/20 bg-cyan-500/10 p-8">
            <h2 className="text-3xl font-black">
              Which Industries Prefer Glossy?
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                "Photographers",
                "Restaurants",
                "Creative Agencies",
                "Retail Brands",
                "Event Companies",
                "Entertainment Businesses",
              ].map((industry) => (
                <div
                  key={industry}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  {industry}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-red-500/20 bg-red-500/10 p-8">
            <h2 className="text-3xl font-black">
              Common Misconceptions
            </h2>

            <div className="mt-6 space-y-6 text-[#cbd5e1]">
              <div>
                <h3 className="font-bold text-white">
                  Matte Isn't Boring
                </h3>
                <p className="mt-2">
                  Matte finishes often appear more sophisticated and
                  luxurious than glossy finishes.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white">
                  Glossy Isn't Always Better
                </h3>
                <p className="mt-2">
                  While glossy cards offer stronger color vibrancy, they
                  aren't always the most professional choice for every
                  industry.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-8">
            <h2 className="text-3xl font-black">
              Frequently Asked Questions
            </h2>

            <div className="mt-8 space-y-8">
              <div>
                <h3 className="text-xl font-bold">
                  Which finish looks more professional?
                </h3>
                <p className="mt-3 text-[#cbd5e1]">
                  Matte business cards are generally considered more
                  professional because of their understated appearance.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  Which finish is better for photos?
                </h3>
                <p className="mt-3 text-[#cbd5e1]">
                  Glossy cards typically produce more vibrant photographs
                  and graphics.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  Can you write on matte cards?
                </h3>
                <p className="mt-3 text-[#cbd5e1]">
                  Yes. Matte cards are significantly easier to write on
                  compared to glossy finishes.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  Which finish should I choose?
                </h3>
                <p className="mt-3 text-[#cbd5e1]">
                  If professionalism and readability are priorities,
                  choose matte. If color vibrancy and visual impact are
                  most important, choose glossy.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[36px] border border-[#6366f1]/20 bg-[linear-gradient(135deg,rgba(99,102,241,.12),rgba(59,130,246,.12))] p-10 text-center">
            <h2 className="text-5xl font-black tracking-tight">
              Final Verdict
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#cbd5e1]">
              For most professional businesses, matte business cards offer
              the best balance of readability, elegance, and premium feel.
              However, glossy cards remain an excellent choice for brands
              that rely heavily on vibrant imagery, photography, and bold
              visual presentation.
            </p>

            <Link
              href="/business-card-designer"
              className="mt-8 inline-flex rounded-2xl bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] px-8 py-4 font-black text-white shadow-[0_12px_40px_rgba(99,102,241,0.35)]"
            >
              Design Your Business Cards
            </Link>
          </section>
        </article>
      </div>
    </main>
  );
}