import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "DTF vs Screen Printing: Which Printing Method Is Best? | PRNTD",
  description:
    "Compare DTF and screen printing to find the best option for your custom apparel project, business, or brand.",
};

export default function DTFvsScreenPrintingPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-6 inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300">
          Print Comparison Guide
        </div>

        <h1 className="text-5xl font-black tracking-tight md:text-7xl">
          DTF vs
          <span className="block bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Screen Printing
          </span>
        </h1>

        <p className="mt-8 max-w-3xl text-xl text-slate-300">
          Choosing the right printing method can impact cost, durability,
          color quality, and turnaround time. Here's everything you need
          to know about DTF and screen printing before placing your next
          apparel order.
        </p>

        <article className="mt-16 space-y-10">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-bold">
              What Is DTF Printing?
            </h2>

            <p className="mt-4 text-slate-300">
              DTF (Direct-to-Film) printing transfers full-color artwork
              onto fabric using specialized film, adhesive powder, and
              heat pressing. It allows highly detailed designs with
              vibrant colors and works on a wide range of garment types.
            </p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-bold">
              What Is Screen Printing?
            </h2>

            <p className="mt-4 text-slate-300">
              Screen printing uses mesh screens and ink layers to create
              designs on garments. It has been an industry standard for
              decades and is especially popular for large-volume apparel
              orders.
            </p>
          </section>

          <section className="rounded-3xl border border-green-500/20 bg-green-500/10 p-8">
            <h2 className="text-3xl font-bold">
              Advantages of DTF Printing
            </h2>

            <ul className="mt-6 space-y-3 text-slate-300">
              <li>✓ Unlimited colors and gradients</li>
              <li>✓ Excellent for small orders</li>
              <li>✓ No screen setup fees</li>
              <li>✓ Works on cotton, polyester, and blends</li>
              <li>✓ Great for detailed artwork and photos</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-8">
            <h2 className="text-3xl font-bold">
              Advantages of Screen Printing
            </h2>

            <ul className="mt-6 space-y-3 text-slate-300">
              <li>✓ Extremely durable prints</li>
              <li>✓ Cost-effective for large quantities</li>
              <li>✓ Vibrant solid colors</li>
              <li>✓ Ideal for simple logos and branding</li>
              <li>✓ Trusted commercial printing method</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-bold">
              Best Choice for Small Orders
            </h2>

            <p className="mt-4 text-slate-300">
              DTF is typically the better option for one-off prints,
              sample runs, personalized garments, and short production
              batches because there are no screen setup requirements.
            </p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-bold">
              Best Choice for Large Orders
            </h2>

            <p className="mt-4 text-slate-300">
              Screen printing often becomes more economical at higher
              quantities because setup costs are spread across larger
              production runs.
            </p>
          </section>

          <section className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8">
            <h2 className="text-3xl font-bold">
              Potential Drawbacks
            </h2>

            <ul className="mt-6 space-y-3 text-slate-300">
              <li>✗ DTF can feel slightly heavier on fabric</li>
              <li>✗ Screen printing setup costs increase for small runs</li>
              <li>✗ Screen printing is limited by color count</li>
              <li>✗ DTF may not be ideal for extremely large production runs</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-violet-500/20 bg-violet-500/10 p-8">
            <h2 className="text-3xl font-bold">
              Quick Comparison
            </h2>

            <ul className="mt-6 space-y-3 text-slate-300">
              <li>✓ Small Orders → DTF</li>
              <li>✓ Full-Color Designs → DTF</li>
              <li>✓ Large Bulk Orders → Screen Printing</li>
              <li>✓ Photo-Quality Artwork → DTF</li>
              <li>✓ Simple Logo Designs → Screen Printing</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-green-500/20 bg-green-500/10 p-8">
            <h2 className="text-3xl font-bold">
              Which Method Should You Choose?
            </h2>

            <p className="mt-4 text-slate-300">
              If you need low minimums, fast turnaround times, custom
              names, or highly detailed artwork, DTF is usually the
              better choice. For large-scale orders with simple designs,
              screen printing may provide the lowest cost per shirt.
            </p>
          </section>

          <section className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 p-10 text-center">
            <h2 className="text-4xl font-black">
              Ready to Print Your Design?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-300">
              Upload your artwork and create custom apparel with premium
              DTF printing from PRNTD.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-flex rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 font-semibold text-white"
            >
              Start Your Order
            </Link>
          </section>
        </article>
      </div>
    </main>
  );
}