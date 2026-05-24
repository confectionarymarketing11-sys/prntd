import Link from "next/link";

type ToolCard = {
  title: string;
  description: string;
  href: string;
  action: string;
};

const toolCards: ToolCard[] = [
  {
    title: "Custom Print Products",
    description:
      "Premium apparel, business cards, stickers, labels, and branded products designed for modern businesses.",
    href: "/products",
    action: "Shop Products",
  },
  {
    title: "Design Creator",
    description:
      "Generate professional artwork, branded assets, and print-ready designs with integrated AI tools.",
    href: "/design-generator",
    action: "Open Designer",
  },
  {
    title: "Background Removal",
    description:
      "Clean product photos and apparel images instantly for ecommerce, menus, branding, and marketing.",
    href: "/background-remover",
    action: "Remove Background",
  },
  {
    title: "Dynamic QR Codes",
    description:
      "Launch editable QR campaigns with analytics, redirects, scan tracking, and customer insights.",
    href: "/qr-dashboard",
    action: "Manage QR Codes",
  },
];

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#7c3aed_100%)] px-7 py-4 text-sm font-black text-white no-underline shadow-[0_10px_30px_rgba(99,102,241,0.35)] transition duration-200 hover:-translate-y-1"
    >
      {children}
    </Link>
  );
}

function SecondaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black text-white no-underline backdrop-blur transition duration-200 hover:-translate-y-1 hover:bg-white/10"
    >
      {children}
    </Link>
  );
}

function ToolCardView({ card }: { card: ToolCard }) {
  return (
    <article className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#6366f1]/50 hover:bg-white/[0.06] hover:shadow-[0_20px_60px_rgba(79,70,229,0.18)]">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,#3b82f6,#6366f1,#7c3aed)] opacity-0 transition group-hover:opacity-100" />

      <h3 className="text-3xl font-black tracking-tight text-white">
        {card.title}
      </h3>

      <p className="mt-4 text-[15px] leading-7 text-[#cbd5e1]">
        {card.description}
      </p>

      <div className="mt-7">
        <PrimaryButton href={card.href}>
          {card.action}
        </PrimaryButton>
      </div>
    </article>
  );
}

export default function PrntdToolsLanding() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[#4f46e5]/30 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-[#2563eb]/20 blur-[160px]" />
      </div>

      {/* HERO */}
      <section className="relative z-10 px-6 pb-24 pt-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-8 inline-flex items-center rounded-full border border-[#6366f1]/30 bg-white/5 px-5 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#a5b4fc] backdrop-blur">
              Premium Print + AI Business Platform
            </div>

            <h1 className="text-[clamp(58px,8vw,110px)] font-black leading-[0.92] tracking-[-0.04em] text-white">
              Build a Stronger Brand
              <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                Online and In Person
              </span>
            </h1>

            <p className="mx-auto mt-10 max-w-[900px] text-[20px] leading-[1.9] text-[#94a3b8]">
              PRNTD combines premium custom printing with AI-powered design
              tools, QR systems, customer portals, and ecommerce automation —
              all in one modern platform.
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-5">
              <PrimaryButton href="/products">
                Shop Products
              </PrimaryButton>

              <SecondaryButton href="/dashboard">
                Open Customer Portal
              </SecondaryButton>
            </div>
          </div>
        </div>
      </section>

      {/* TOOL GRID */}
      <section className="relative z-10 px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <h2 className="text-[clamp(42px,5vw,72px)] font-black leading-none tracking-[-0.03em]">
              Print Products + Smart Tools
            </h2>

            <p className="mx-auto mt-5 max-w-[760px] text-lg leading-8 text-[#94a3b8]">
              Everything needed to design, manage, print, and grow your brand
              from one unified platform.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
            {toolCards.map((card) => (
              <ToolCardView key={card.title} card={card} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative z-10 px-6 pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#111827_40%,#312e81_100%)] px-10 py-20 text-center shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.35),transparent_45%)]" />

            <div className="relative z-10">
              <h2 className="text-[clamp(44px,5vw,78px)] font-black leading-[0.95] tracking-[-0.04em]">
                Launch Your Brand
                <span className="block text-[#a5b4fc]">
                  With PRNTD
                </span>
              </h2>

              <p className="mx-auto mt-8 max-w-[760px] text-lg leading-8 text-[#cbd5e1]">
                Premium print products, AI-powered design systems, and modern
                business tools built for creators, startups, and growing brands.
              </p>

              <div className="mt-12 flex flex-wrap justify-center gap-5">
                <PrimaryButton href="/products">
                  Start Shopping
                </PrimaryButton>

                <SecondaryButton href="/dashboard">
                  Customer Portal
                </SecondaryButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}