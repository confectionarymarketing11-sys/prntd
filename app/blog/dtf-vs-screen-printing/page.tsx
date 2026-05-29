import type { Metadata } from "next";
import Link from "next/link";
import ShopHeader from "@/components/ShopHeader";

export const metadata: Metadata = {
  title:
    "DTF vs Screen Printing: Which Printing Method Is Better in 2026? | PRNTD",
  description:
    "Compare DTF printing and screen printing for cost, durability, print quality, turnaround time, and fabric compatibility. Find the best option for your apparel project.",
};

export default function DTFvsScreenPrintingPage() {
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
              Apparel Printing Guide
            </div>

            <h1 className="mt-8 text-[clamp(48px,8vw,92px)] font-black leading-[0.95] tracking-[-0.06em]">
              DTF vs
              <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                Screen Printing
              </span>
            </h1>

            <p className="mt-8 max-w-3xl text-xl leading-9 text-[#cbd5e1]">
              Choosing the right printing method can save money, improve
              quality, and help your apparel last longer. This guide
              compares DTF and screen printing across cost, durability,
              detail, turnaround time, and real-world use cases.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="rounded-2xl bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] px-8 py-4 font-black text-white shadow-[0_12px_40px_rgba(99,102,241,0.35)]"
              >
                Start Designing
              </Link>

              <Link
                href="/contact"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-4 font-black text-white"
              >
                Request Quote
              </Link>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-[#94a3b8]">Best For</p>
                <h3 className="mt-2 text-xl font-black">Small Orders</h3>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-[#94a3b8]">Winner</p>
                <h3 className="mt-2 text-xl font-black">DTF Quality</h3>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-[#94a3b8]">Best Durability</p>
                <h3 className="mt-2 text-xl font-black">Screen Print</h3>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-[#94a3b8]">Updated</p>
                <h3 className="mt-2 text-xl font-black">2026 Guide</h3>
              </div>
            </div>
          </div>
        </section>

        <article className="mx-auto max-w-6xl px-6 py-16 space-y-10">

          <section className="rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-8">
            <h2 className="text-3xl font-black">
              What Is DTF Printing?
            </h2>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              DTF, short for Direct-to-Film printing, is one of the
              fastest-growing apparel decoration methods in the industry.
              Instead of printing directly onto fabric, artwork is first
              printed onto a specialized film and then transferred to the
              garment using heat and adhesive powder.
            </p>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              This process allows for highly detailed artwork, unlimited
              colors, gradients, shadows, and photographic designs that
              would be difficult or expensive to produce using traditional
              screen printing.
            </p>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              DTF has become especially popular among creators, Etsy
              sellers, small brands, sports teams, and businesses because
              there are no expensive setup fees and no minimum order
              requirements.
            </p>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-8">
            <h2 className="text-3xl font-black">
              What Is Screen Printing?
            </h2>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              Screen printing uses mesh screens to push ink directly onto
              fabric. Each color in a design typically requires its own
              screen, making setup more time-consuming than digital
              printing methods.
            </p>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              Despite being one of the oldest printing technologies,
              screen printing remains incredibly popular due to its
              durability, vibrant solid colors, and ability to produce
              large quantities efficiently.
            </p>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              Major apparel brands, schools, corporations, and event
              organizers continue to rely on screen printing for large
              production runs.
            </p>
          </section>

          <section className="rounded-[32px] border border-cyan-500/20 bg-cyan-500/10 p-8">
            <h2 className="text-3xl font-black">
              DTF vs Screen Printing Comparison
            </h2>

            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-4">Feature</th>
                    <th className="pb-4">DTF</th>
                    <th className="pb-4">Screen Printing</th>
                  </tr>
                </thead>

                <tbody className="text-[#cbd5e1]">
                  <tr className="border-b border-white/10">
                    <td className="py-4">Small Orders</td>
                    <td>🏆 Excellent</td>
                    <td>Limited</td>
                  </tr>

                  <tr className="border-b border-white/10">
                    <td className="py-4">Large Orders</td>
                    <td>Good</td>
                    <td>🏆 Excellent</td>
                  </tr>

                  <tr className="border-b border-white/10">
                    <td className="py-4">Photographs</td>
                    <td>🏆 Excellent</td>
                    <td>Poor</td>
                  </tr>

                  <tr className="border-b border-white/10">
                    <td className="py-4">Unlimited Colors</td>
                    <td>🏆 Yes</td>
                    <td>No</td>
                  </tr>

                  <tr className="border-b border-white/10">
                    <td className="py-4">Durability</td>
                    <td>Very Good</td>
                    <td>🏆 Excellent</td>
                  </tr>

                  <tr>
                    <td className="py-4">Setup Costs</td>
                    <td>🏆 Low</td>
                    <td>Higher</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[32px] border border-green-500/20 bg-green-500/10 p-8">
            <h2 className="text-3xl font-black">
              Cost Comparison
            </h2>

            <div className="mt-6 space-y-5 text-lg leading-8 text-[#cbd5e1]">
              <p>
                <strong>1–25 Shirts:</strong> DTF is almost always the
                better value because there are no screen setup fees.
              </p>

              <p>
                <strong>25–100 Shirts:</strong> Both methods can be
                competitive depending on artwork complexity and color
                count.
              </p>

              <p>
                <strong>100–500 Shirts:</strong> Screen printing often
                begins offering lower costs per garment.
              </p>

              <p>
                <strong>500+ Shirts:</strong> Screen printing is usually
                the most economical option for high-volume production.
              </p>
            </div>
          </section>

          <section className="rounded-[32px] border border-violet-500/20 bg-violet-500/10 p-8">
            <h2 className="text-3xl font-black">
              Which Produces Better Print Quality?
            </h2>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              When it comes to detail, DTF is difficult to beat. Fine
              lines, gradients, shadows, small text, and photographic
              artwork can be reproduced with incredible accuracy.
            </p>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              Screen printing excels with simple, bold graphics and
              vibrant solid colors. However, designs become increasingly
              expensive as more colors are added.
            </p>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              For highly detailed artwork, DTF is usually the clear
              winner.
            </p>
          </section>

          <section className="rounded-[32px] border border-red-500/20 bg-red-500/10 p-8">
            <h2 className="text-3xl font-black">
              Durability Comparison
            </h2>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              Modern DTF prints are extremely durable and can withstand
              dozens of wash cycles when applied properly.
            </p>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              However, screen printing still has a slight advantage in
              overall longevity. A professionally screen-printed design
              can often outlast the garment itself.
            </p>

            <p className="mt-5 text-lg leading-8 text-[#cbd5e1]">
              If maximum durability is your only concern, screen printing
              remains the benchmark.
            </p>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-8">
            <h2 className="text-3xl font-black">
              Fabric Compatibility
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                "Cotton",
                "Polyester",
                "Tri-Blends",
                "Performance Wear",
                "Hoodies",
                "Athletic Apparel",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  ✓ {item}
                </div>
              ))}
            </div>

            <p className="mt-6 text-lg leading-8 text-[#cbd5e1]">
              While both methods work well on cotton garments, DTF
              generally offers greater flexibility across different
              fabric types.
            </p>
          </section>

          <section className="rounded-[32px] border border-green-500/20 bg-green-500/10 p-8">
            <h2 className="text-3xl font-black">
              Why Small Businesses Prefer DTF
            </h2>

            <ul className="mt-6 space-y-4 text-lg text-[#cbd5e1]">
              <li>✓ No minimum orders</li>
              <li>✓ Lower startup costs</li>
              <li>✓ Unlimited colors</li>
              <li>✓ Fast turnaround times</li>
              <li>✓ Easy personalization</li>
              <li>✓ Perfect for testing new products</li>
            </ul>
          </section>

          <section className="rounded-[32px] border border-amber-500/20 bg-amber-500/10 p-8">
            <h2 className="text-3xl font-black">
              When Screen Printing Makes Sense
            </h2>

            <ul className="mt-6 space-y-4 text-lg text-[#cbd5e1]">
              <li>✓ Large event merchandise orders</li>
              <li>✓ School apparel programs</li>
              <li>✓ Corporate uniforms</li>
              <li>✓ 250+ garment runs</li>
              <li>✓ Simple one-color logos</li>
              <li>✓ Large-scale production</li>
            </ul>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-8">
            <h2 className="text-3xl font-black">
              Frequently Asked Questions
            </h2>

            <div className="mt-8 space-y-8">
              <div>
                <h3 className="text-xl font-bold">
                  Is DTF better than screen printing?
                </h3>
                <p className="mt-3 text-[#cbd5e1]">
                  For small and medium-sized orders, DTF is often the
                  better choice due to flexibility, lower setup costs,
                  and superior detail reproduction.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  Which lasts longer?
                </h3>
                <p className="mt-3 text-[#cbd5e1]">
                  Screen printing generally has a slight edge in
                  durability.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  Can DTF print photographs?
                </h3>
                <p className="mt-3 text-[#cbd5e1]">
                  Yes. DTF is one of the best methods available for
                  printing photographic and highly detailed artwork.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  Which is cheaper?
                </h3>
                <p className="mt-3 text-[#cbd5e1]">
                  DTF is typically cheaper for small orders, while screen
                  printing becomes more economical as quantities grow.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[36px] border border-[#6366f1]/20 bg-[linear-gradient(135deg,rgba(99,102,241,.12),rgba(59,130,246,.12))] p-10 text-center">
            <h2 className="text-5xl font-black tracking-tight">
              Final Verdict
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#cbd5e1]">
              For most modern apparel projects, DTF provides the best
              combination of flexibility, color capability, print
              quality, and affordability. Screen printing remains the
              champion for very large production runs, but DTF has become
              the preferred solution for many businesses, creators,
              events, and growing brands.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-flex rounded-2xl bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] px-8 py-4 font-black text-white shadow-[0_12px_40px_rgba(99,102,241,0.35)]"
            >
              Start Your Custom Order
            </Link>
          </section>
        </article>
      </div>
    </main>
  );
}