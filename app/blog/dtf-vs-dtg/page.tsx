
import type { Metadata } from "next";
import Link from "next/link";
import ShopHeader from "@/components/ShopHeader";

export const metadata: Metadata = {
  title:
    "DTF vs DTG Printing: What's the Difference in 2026? | PRNTD",
  description:
    "Compare DTF vs DTG printing for custom apparel. Learn about durability, print quality, fabric compatibility, cost, and which printing method is best for your project.",
};

export default function DTFvsDTGPage() {
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
              Apparel Printing Guide
            </div>

            <h1 className="mt-8 text-[clamp(48px,8vw,92px)] font-black leading-[0.95] tracking-[-0.06em]">
              DTF vs
              <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                DTG Printing
              </span>
            </h1>

            <p className="mt-8 max-w-3xl text-xl leading-9 text-[#cbd5e1]">
              DTF and DTG are two of the most popular custom apparel
              printing methods available today. Learn the differences
              in durability, quality, fabric compatibility, cost, and
              which option is best for your next custom apparel project.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/designer?product=classic-tee"
                className="rounded-2xl bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] px-8 py-4 font-black text-white shadow-[0_12px_40px_rgba(99,102,241,0.35)]"
              >
                Design Custom Shirts
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

        <article className="mx-auto max-w-6xl space-y-10 px-6 py-16">

          <section className="rounded-[32px] border border-cyan-500/20 bg-cyan-500/10 p-8">
            <h2 className="text-3xl font-black">
              Quick Comparison
            </h2>

            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-4">Feature</th>
                    <th className="pb-4">DTF</th>
                    <th className="pb-4">DTG</th>
                  </tr>
                </thead>

                <tbody className="text-[#cbd5e1]">
                  <tr className="border-b border-white/10">
                    <td className="py-4">Fabric Compatibility</td>
                    <td>🏆 Excellent</td>
                    <td>Cotton Only</td>
                  </tr>

                  <tr className="border-b border-white/10">
                    <td className="py-4">Durability</td>
                    <td>🏆 Excellent</td>
                    <td>Good</td>
                  </tr>

                  <tr className="border-b border-white/10">
                    <td className="py-4">Color Vibrancy</td>
                    <td>🏆 Excellent</td>
                    <td>Very Good</td>
                  </tr>

                  <tr className="border-b border-white/10">
                    <td className="py-4">Soft Feel</td>
                    <td>Very Good</td>
                    <td>🏆 Excellent</td>
                  </tr>

                  <tr>
                    <td className="py-4">Dark Garments</td>
                    <td>🏆 Excellent</td>
                    <td>Good</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-8">
            <h2 className="text-3xl font-black">
              What Is DTF Printing?
            </h2>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              DTF (Direct-to-Film) printing transfers designs from a
              special film onto apparel using heat and pressure. The
              process produces vibrant colors, strong durability, and
              works on cotton, polyester, blends, and performance fabrics.
            </p>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              DTF has become one of the fastest-growing printing methods
              because it combines flexibility, affordability, and
              excellent print quality.
            </p>
          </section>

          <section className="rounded-[32px] border border-green-500/20 bg-green-500/10 p-8">
            <h2 className="text-3xl font-black">
              Advantages of DTF Printing
            </h2>

            <ul className="mt-6 space-y-4 text-lg text-[#cbd5e1]">
              <li>✓ Vibrant full-color prints</li>
              <li>✓ Excellent durability</li>
              <li>✓ Works on cotton and polyester</li>
              <li>✓ Ideal for dark garments</li>
              <li>✓ No minimum order quantities</li>
              <li>✓ Great for logos and branding</li>
            </ul>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-8">
            <h2 className="text-3xl font-black">
              What Is DTG Printing?
            </h2>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              DTG (Direct-to-Garment) printing applies water-based inks
              directly onto fabric using specialized printers. DTG is
              known for soft-feeling prints and impressive photographic
              detail on cotton apparel.
            </p>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              Because the ink absorbs into the garment fibers, DTG
              creates a very natural feel compared to transfer-based
              printing methods.
            </p>
          </section>

          <section className="rounded-[32px] border border-violet-500/20 bg-violet-500/10 p-8">
            <h2 className="text-3xl font-black">
              Advantages of DTG Printing
            </h2>

            <ul className="mt-6 space-y-4 text-lg text-[#cbd5e1]">
              <li>✓ Extremely soft hand feel</li>
              <li>✓ Great for detailed artwork</li>
              <li>✓ Excellent photographic prints</li>
              <li>✓ No setup fees</li>
              <li>✓ Ideal for small runs</li>
              <li>✓ Natural print appearance</li>
            </ul>
          </section>

          <section className="rounded-[32px] border border-amber-500/20 bg-amber-500/10 p-8">
            <h2 className="text-3xl font-black">
              Durability Comparison
            </h2>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              DTF prints typically outperform DTG when it comes to
              long-term durability. The transfer layer provides strong
              resistance against repeated washing, stretching, and daily
              wear.
            </p>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              DTG remains durable but may fade more quickly over time,
              especially when garments are not washed according to care
              instructions.
            </p>
          </section>

          <section className="rounded-[32px] border border-cyan-500/20 bg-cyan-500/10 p-8">
            <h2 className="text-3xl font-black">
              Fabric Compatibility
            </h2>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              One of DTF's biggest advantages is its ability to print on
              cotton, polyester, blends, and performance fabrics.
            </p>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              DTG performs best on 100% cotton garments and may produce
              less consistent results on polyester fabrics.
            </p>
          </section>

          <section className="rounded-[32px] border border-red-500/20 bg-red-500/10 p-8">
            <h2 className="text-3xl font-black">
              Cost Comparison
            </h2>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              For many businesses and custom apparel projects, DTF
              printing offers better overall value. The process is
              efficient, versatile, and often more cost-effective across
              different garment types.
            </p>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              DTG can be ideal for certain cotton garments and highly
              detailed artwork but may carry higher production costs in
              some situations.
            </p>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-8">
            <h2 className="text-3xl font-black">
              Frequently Asked Questions
            </h2>

            <div className="mt-8 space-y-8">
              <div>
                <h3 className="text-xl font-bold">
                  Which lasts longer, DTF or DTG?
                </h3>
                <p className="mt-3 text-[#cbd5e1]">
                  DTF generally offers superior durability and wash
                  resistance compared to DTG.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  Which feels softer?
                </h3>
                <p className="mt-3 text-[#cbd5e1]">
                  DTG typically produces a softer feel because the ink
                  absorbs into the garment fibers.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  Can DTF print on polyester?
                </h3>
                <p className="mt-3 text-[#cbd5e1]">
                  Yes. DTF performs exceptionally well on polyester and
                  blended fabrics.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  Which method is best overall?
                </h3>
                <p className="mt-3 text-[#cbd5e1]">
                  For most custom apparel projects, DTF offers the best
                  balance of durability, versatility, color vibrancy, and
                  value.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[36px] border border-[#6366f1]/20 bg-[linear-gradient(135deg,rgba(99,102,241,.12),rgba(59,130,246,.12))] p-10 text-center">
            <h2 className="text-5xl font-black tracking-tight">
              Final Verdict
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#cbd5e1]">
              While DTG remains an excellent option for soft-feeling
              cotton prints, DTF printing has emerged as the more
              versatile solution for modern custom apparel. Its superior
              durability, fabric compatibility, vibrant colors, and
              overall value make it the preferred choice for most custom
              t-shirt projects.
            </p>

            <Link
              href="/designer?product=classic-tee"
              className="mt-8 inline-flex rounded-2xl bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] px-8 py-4 font-black text-white shadow-[0_12px_40px_rgba(99,102,241,0.35)]"
            >
              Design Your Custom Shirt
            </Link>
          </section>

        </article>
      </div>
    </main>
  );
}

