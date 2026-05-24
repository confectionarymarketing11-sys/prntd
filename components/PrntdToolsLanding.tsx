import Link from "next/link";

type ToolCard = {
  title: string;
  description: string;
  href: string;
  action: string;
  isCentered?: boolean;
};

type StepCard = {
  number: string;
  title: string;
  description: string;
};

type HeroStat = {
  value: string;
  label: string;
};

const toolCards: ToolCard[] = [
  {
    title: "Custom Print Products",
    description: "Business cards, stickers, labels, apparel, and branded products designed for modern businesses.",
    href: "/products",
    action: "Shop Products",
  },
  {
    title: "Design Creator",
    description: "Create professional designs, branded assets, and print-ready artwork with integrated design tools.",
    href: "/design-generator",
    action: "Create Designs",
  },
  {
    title: "Image Background Removal",
    description: "Clean product images instantly for apparel, menus, product photography, and ecommerce use.",
    href: "/background-remover",
    action: "Remove Background",
  },
  {
    title: "Dynamic QR Codes",
    description: "Build editable QR campaigns with analytics, scan tracking, live redirects, and customer insights.",
    href: "/qr-dashboard",
    action: "Manage QR Codes",
    isCentered: true,
  },
];

const steps: StepCard[] = [
  {
    number: "1",
    title: "Create",
    description: "Build custom designs, QR codes, remove backgrounds, and create professional print-ready assets in minutes.",
  },
  {
    number: "2",
    title: "Print",
    description: "Apply designs and QR codes directly to premium business cards, stickers, and apparel.",
  },
  {
    number: "3",
    title: "Grow",
    description: "Track and manage QR analytics, tools, and saved designs through one customer dashboard.",
  },
];

const heroStats: HeroStat[] = [
  {
    value: "3",
    label: "custom product lines",
  },
  {
    value: "24/7",
    label: "self-serve design tools",
  },
  {
    value: "CAD",
    label: "checkout and reports",
  },
];

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-13 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#7c3aed_100%)] px-7 py-3.5 text-[15px] font-bold text-white no-underline shadow-[0_8px_18px_rgba(99,102,241,0.14)] transition hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#2563eb_0%,#4f46e5_45%,#6d28d9_100%)] max-md:w-full max-md:hover:translate-y-0"
    >
      {children}
    </Link>
  );
}

function SecondaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-13 items-center justify-center rounded-[18px] border border-[#e8ecf4] bg-white px-7 py-3.5 text-[15px] font-bold text-[#111827] no-underline transition hover:-translate-y-0.5 max-md:w-full max-md:hover:translate-y-0"
    >
      {children}
    </Link>
  );
}

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-9 text-center">
      <h2 className="text-[clamp(36px,5vw,58px)] font-extrabold leading-[1.05] tracking-normal text-[#111827]">
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-3.5 max-w-[760px] text-[17px] leading-8 text-[#6b7280] max-md:text-sm">
          {description}
        </p>
      )}
    </div>
  );
}

function ToolCardView({ card }: { card: ToolCard }) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/95 p-[34px] text-center shadow-[0_10px_28px_rgba(0,0,0,0.05)] transition duration-200 hover:-translate-y-1 hover:border-[#dbe4ff] hover:shadow-[0_16px_30px_rgba(0,0,0,0.06)] max-md:rounded-[22px] max-md:p-[26px_22px] max-md:shadow-[0_5px_16px_rgba(0,0,0,0.045)] max-md:hover:translate-y-0 ${
        card.isCentered ? "min-[901px]:col-start-2" : ""
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#7c3aed_100%)] opacity-0 transition group-hover:opacity-100" />
      <h3 className="mb-4 text-[28px] font-extrabold leading-[1.15] tracking-normal text-[#111827] max-md:text-2xl">
        {card.title}
      </h3>
      <p className="mb-6 text-[15px] leading-7 text-[#4b5563] max-md:text-sm">{card.description}</p>
      <PrimaryButton href={card.href}>{card.action}</PrimaryButton>
    </article>
  );
}

function StepCardView({ step }: { step: StepCard }) {
  return (
    <article className="min-h-60 rounded-[28px] border border-white/70 bg-white/95 p-[34px] text-center shadow-[0_10px_28px_rgba(0,0,0,0.05)] transition duration-200 hover:-translate-y-1 hover:border-[#dbe4ff] hover:shadow-[0_16px_30px_rgba(0,0,0,0.06)] max-md:rounded-[22px] max-md:p-[26px_22px] max-md:shadow-[0_5px_16px_rgba(0,0,0,0.045)] max-md:hover:translate-y-0">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#7c3aed_100%)] text-xl font-extrabold text-white">
        {step.number}
      </div>
      <h3 className="mb-4 text-[28px] font-extrabold leading-[1.15] tracking-normal text-[#111827] max-md:text-2xl">
        {step.title}
      </h3>
      <p className="text-[15px] leading-7 text-[#4b5563] max-md:text-sm">{step.description}</p>
    </article>
  );
}

export default function PrntdToolsLanding() {
  return (
    <div className="w-full bg-[linear-gradient(180deg,#f8fbff_0%,#f5f7fb_36%,#f5f7fb_100%)] text-[#111827]">
      <section className="relative overflow-hidden px-0 pb-[34px] pt-16 max-md:pb-9 max-md:pt-14">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#c7d2fe,transparent)]" />
        <div className="mx-auto max-w-7xl px-[22px]">
          <div className="mx-auto max-w-[980px] text-center">
            <div className="mb-7 inline-flex items-center justify-center rounded-full border border-[#dde5ff] bg-[linear-gradient(135deg,#eef4ff_0%,#eef2ff_45%,#f5f3ff_100%)] px-[18px] py-2.5 text-[13px] font-bold text-[#4f46e5] shadow-[0_8px_24px_rgba(99,102,241,0.08)]">
              Premium Print + Smart Business Tools
            </div>
            <h1 className="mb-6 text-[clamp(40px,6vw,78px)] font-extrabold leading-[1.02] tracking-normal text-[#111827]">
              Build a Stronger Brand Online and In Person
            </h1>
            <p className="mx-auto mb-9 max-w-[820px] text-[19px] leading-[1.8] text-[#6b7280] max-md:text-[15px]">
              From premium printed products to design creation, background removal, dynamic QR analytics systems, and customer
              portals, PRNTD helps businesses stay professional, organized, and ready to grow.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <PrimaryButton href="/products">Shop Products</PrimaryButton>
              <SecondaryButton href="/dashboard">Customer Portal</SecondaryButton>
            </div>
            <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 overflow-hidden rounded-[24px] border border-white/80 bg-white/80 text-left shadow-[0_12px_36px_rgba(15,23,42,0.06)] backdrop-blur max-md:grid-cols-1">
              {heroStats.map((stat) => (
                <div key={stat.label} className="border-[#e8ecf4] px-6 py-5 max-md:border-b md:border-r last:border-0">
                  <p className="text-2xl font-black text-[#111827]">{stat.value}</p>
                  <p className="mt-1 text-sm font-semibold text-[#6b7280]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-0 py-[42px]">
        <div className="mx-auto max-w-7xl px-[22px]">
          <SectionTitle title="Print Products + Smart Tools" />
          <div className="grid grid-cols-3 gap-6 max-[900px]:grid-cols-1">
            {toolCards.map((card) => (
              <ToolCardView key={card.title} card={card} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,rgba(255,255,255,0.4),rgba(255,255,255,0.7))] px-0 py-[42px]">
        <div className="mx-auto max-w-7xl px-[22px]">
          <SectionTitle
            title="Built for Modern Brands"
            description="PRNTD combines premium printing with powerful digital tools to help businesses simplify operations and grow professionally."
          />
          <div className="grid grid-cols-3 gap-6 max-[900px]:grid-cols-1">
            {steps.map((step) => (
              <StepCardView key={step.number} step={step} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-0 py-[42px] text-center">
        <div className="mx-auto max-w-7xl px-[22px]">
          <div className="rounded-[32px] border border-white/70 bg-white/95 px-10 py-[60px] shadow-[0_10px_28px_rgba(0,0,0,0.05)] max-md:rounded-3xl max-md:px-[22px] max-md:py-[38px] max-md:shadow-[0_5px_16px_rgba(0,0,0,0.045)]">
            <h2 className="mb-[18px] text-[clamp(40px,5vw,64px)] font-extrabold leading-[1.05] tracking-normal text-[#111827]">
              Build Your Brand With PRNTD
            </h2>
            <p className="mx-auto mb-[34px] max-w-[760px] text-lg leading-[1.8] text-[#6b7280] max-md:text-[15px]">
              Modern print products, creative tools, and business systems designed to help your brand stand out.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <PrimaryButton href="/products">Start Shopping</PrimaryButton>
              <SecondaryButton href="/dashboard">Customer Portal</SecondaryButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
