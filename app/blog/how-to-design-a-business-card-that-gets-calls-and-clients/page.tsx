import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "How to Design a Business Card That Gets Calls and Clients | PRNTD",
  description:
    "Learn how to design professional business cards that build trust, generate leads, and help grow your business.",
};

export default function BusinessCardGuidePage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-6 inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300">
          Business Card Guide
        </div>

        <h1 className="text-5xl font-black tracking-tight md:text-7xl">
          How to Design a
          <span className="block bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Business Card
          </span>
          That Gets Calls and Clients
        </h1>

        <p className="mt-8 max-w-3xl text-xl text-slate-300">
          A great business card does more than share contact information. It
          creates trust, reinforces your brand, and helps potential customers
          remember you long after the conversation ends.
        </p>

        <article className="mt-16 space-y-10">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-bold">
              Why Business Cards Still Matter
            </h2>

            <p className="mt-4 text-slate-300">
              Business cards remain one of the easiest ways to exchange
              information at networking events, trade shows, client meetings,
              and local business interactions.
            </p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-bold">
              Include Only Essential Information
            </h2>

            <ul className="mt-6 space-y-3 text-slate-300">
              <li>✓ Business name</li>
              <li>✓ Your name</li>
              <li>✓ Job title</li>
              <li>✓ Phone number</li>
              <li>✓ Email address</li>
              <li>✓ Website</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-bold">Keep It Readable</h2>

            <p className="mt-4 text-slate-300">
              Avoid overly decorative fonts. Readability should always be the
              top priority. A customer cannot call you if they cannot read your
              phone number.
            </p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-bold">
              Use White Space Strategically
            </h2>

            <p className="mt-4 text-slate-300">
              Crowded cards look unprofessional. White space helps guide the
              eye and makes important information stand out.
            </p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-bold">Add a QR Code</h2>

            <p className="mt-4 text-slate-300">
              A QR code can instantly send customers to your website, portfolio,
              social media profiles, or contact information.
            </p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-bold">Match Your Brand</h2>

            <ul className="mt-6 space-y-3 text-slate-300">
              <li>✓ Use your brand colors</li>
              <li>✓ Include your logo</li>
              <li>✓ Maintain consistent typography</li>
              <li>✓ Match your website style</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8">
            <h2 className="text-3xl font-bold">
              Common Business Card Mistakes
            </h2>

            <ul className="mt-6 space-y-3 text-slate-300">
              <li>✗ Too much information</li>
              <li>✗ Tiny fonts</li>
              <li>✗ Poor color contrast</li>
              <li>✗ Missing contact information</li>
              <li>✗ Low-resolution graphics</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-green-500/20 bg-green-500/10 p-8">
            <h2 className="text-3xl font-bold">
              Business Card Design Checklist
            </h2>

            <ul className="mt-6 space-y-3 text-slate-300">
              <li>✓ Logo included</li>
              <li>✓ Contact details verified</li>
              <li>✓ QR code tested</li>
              <li>✓ High-resolution artwork</li>
              <li>✓ Brand colors applied</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 p-10 text-center">
            <h2 className="text-4xl font-black">
              Ready to Design Your Business Cards?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-300">
              Create professional business cards with custom layouts, QR codes,
              logos, and premium print quality from PRNTD.
            </p>

            <Link
              href="/business-card-designer"
              className="mt-8 inline-flex rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 font-semibold text-white"
            >
              Design Business Cards
            </Link>
          </section>
        </article>
      </div>
    </main>
  );
}