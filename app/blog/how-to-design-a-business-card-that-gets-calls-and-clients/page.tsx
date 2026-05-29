
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "How to Design a Business Card That Gets Calls and Clients | PRNTD",
  description:
    "Learn how to design a professional business card that gets noticed, builds trust, and generates more calls, leads, and customers.",
};

export default function BusinessCardGuidePage() {
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
              Business Card Guide
            </div>

            <h1 className="mt-8 max-w-5xl text-[clamp(42px,8vw,88px)] font-black leading-[0.95] tracking-[-0.06em]">
              How to Design a
              <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                Business Card
              </span>
              That Gets Calls and Clients
            </h1>

            <p className="mt-8 max-w-3xl text-xl leading-9 text-[#cbd5e1]">
              A business card is often your first impression. The right design
              can make you look professional, memorable, and trustworthy—while
              the wrong design gets tossed in the trash.
            </p>
          </div>
        </section>

        <article className="mx-auto max-w-4xl px-6 py-16">
          <section className="mb-10 rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-8 backdrop-blur-xl">
            <h2 className="text-3xl font-black tracking-tight">
              Why Business Cards Still Matter
            </h2>

            <p className="mt-6 text-lg leading-8 text-[#cbd5e1]">
              Despite social media and smartphones, business cards remain one of
              the fastest ways to exchange contact information and make a
              lasting impression.
            </p>

            <p className="mt-4 text-lg leading-8 text-[#cbd5e1]">
              Whether you're networking, attending trade shows, meeting
              customers, or visiting job sites, a professional card instantly
              communicates credibility.
            </p>
          </section>

          <section className="mb-10 rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-8 backdrop-blur-xl">
            <h2 className="text-3xl font-black tracking-tight">
              Include Only Essential Information
            </h2>

            <p className="mt-6 text-lg leading-8 text-[#cbd5e1]">
              One of the most common mistakes is trying to fit too much
              information onto a small card.
            </p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="text-xl font-bold">
                Every Business Card Should Include:
              </h3>

              <ul className="mt-4 space-y-3 text-[#cbd5e1]">
                <li>✓ Business name</li>
                <li>✓ Your name</li>
                <li>✓ Job title or role</li>
                <li>✓ Phone number</li>
                <li>✓ Website</li>
                <li>✓ Email address</li>
              </ul>
            </div>
          </section>

          <section className="mb-10 rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-8 backdrop-blur-xl">
            <h2 className="text-3xl font-black tracking-tight">
              Keep It Readable
            </h2>

            <p className="mt-6 text-lg leading-8 text-[#cbd5e1]">
              Fancy fonts may look interesting, but readability always comes
              first. If someone struggles to read your phone number or website,
              the card has failed.
            </p>

            <p className="mt-4 text-lg leading-8 text-[#cbd5e1]">
              Use high contrast colors and fonts that remain clear at small
              sizes.
            </p>
          </section>

          <section className="mb-10 rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-8 backdrop-blur-xl">
            <h2 className="text-3xl font-black tracking-tight">
              Use White Space Strategically
            </h2>

            <p className="mt-6 text-lg leading-8 text-[#cbd5e1]">
              Empty space is not wasted space. Clean layouts feel more premium
              and make important information easier to find.
            </p>

            <p className="mt-4 text-lg leading-8 text-[#cbd5e1]">
              A cluttered card often appears less professional than a simple,
              focused design.
            </p>
          </section>

          <section className="mb-10 rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-8 backdrop-blur-xl">
            <h2 className="text-3xl font-black tracking-tight">
              Add a QR Code
            </h2>

            <p className="mt-6 text-lg leading-8 text-[#cbd5e1]">
              QR codes make it easy for customers to visit your website, save
              your contact information, or view your portfolio instantly.
            </p>

            <p className="mt-4 text-lg leading-8 text-[#cbd5e1]">
              They bridge the gap between print and digital marketing and can
              significantly improve engagement.
            </p>
          </section>

          <section className="mb-10 rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-8 backdrop-blur-xl">
            <h2 className="text-3xl font-black tracking-tight">
              Match Your Brand
            </h2>

            <p className="mt-6 text-lg leading-8 text-[#cbd5e1]">
              Your business card should feel like an extension of your brand.
            </p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <ul className="space-y-3 text-[#cbd5e1]">
                <li>✓ Use your brand colors</li>
                <li>✓ Include your logo</li>
                <li>✓ Match your website style</li>
                <li>✓ Maintain consistent typography</li>
                <li>✓ Use professional imagery if appropriate</li>
              </ul>
            </div>
          </section>

          <section className="mb-10 rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-8 backdrop-blur-xl">
            <h2 className="text-3xl font-black tracking-tight">
              Common Business Card Mistakes
            </h2>

            <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
              <ul className="space-y-3 text-[#cbd5e1]">
                <li>✗ Too much information</li>
                <li>✗ Tiny unreadable fonts</li>
                <li>✗ Low-resolution logos</li>
                <li>✗ Poor color contrast</li>
                <li>✗ Missing contact details</li>
                <li>✗ No clear call-to-action</li>
              </ul>
            </div>
          </section>

          <section className="mb-10 rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-8 backdrop-blur-xl">
            <h2 className="text-3xl font-black tracking-tight">
              Business Card Design Checklist
            </h2>

            <div className="mt-8 rounded-2xl border border-green-500/20 bg-green-500/10 p-6">
              <ul className="space-y-3 text-[#cbd5e1]">
                <li>✓ Logo included</li>
                <li>✓ Contact information verified</li>
                <li>✓ Easy-to-read fonts</li>
                <li>✓ QR code tested</li>
                <li>✓ Brand colors applied</li>
                <li>✓ High-resolution artwork used</li>
                <li>✓ Professional appearance</li>
              </ul>
            </div>
          </section>

          <section className="rounded-[36px] border border-[#6366f1]/20 bg-[linear-gradient(135deg,rgba(99,102,241,.12),rgba(59,130,246,.12))] p-10 text-center">
            <h2 className="text-4xl font-black tracking-tight">
              Ready to Design Your Business Cards?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-[#cbd5e1]">
              Create professional business cards with custom layouts, QR codes,
              logos, and premium print quality from PRNTD.
            </p>

            <Link
              href="/business-card-designer"
              className="mt-8 inline-flex rounded-2xl bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] px-8 py-4 font-black text-white shadow-[0_12px_40px_rgba(99,102,241,0.35)]"
            >
              Design Business Cards
            </Link>
          </section>
        </article>
      </div>
    </main>
  );
}

