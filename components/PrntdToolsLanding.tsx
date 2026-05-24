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

function ProductPreviewRail() {
  return (
    <div className="mx-auto mt-14 grid max-w-5xl grid-cols-[1.1fr_0.9fr] gap-5 text-left max-[860px]:grid-cols-1">
      <Link
        href="/products/classic-tee"
        className="group relative min-h-[330px] overflow-hidden rounded-[32px] border border-white/80 bg-white p-6 no-underline shadow-[0_18px_48px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(15,23,42,0.12)] max-md:min-h-[280px] max-md:rounded-3xl"
      >
        <div className="absolute inset-x-0 top-0 h-28 bg-[repeating-linear-gradient(45deg,#eef6ff_0_16px,#f9fafb_16px_32px)] opacity-90" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#4f46e5]">Custom Apparel</p>
            <h3 className="mt-2 text-3xl font-black leading-none text-[#111827]">Print-ready shirt mockups</h3>
          </div>
          <span className="rounded-full bg-[#111827] px-4 py-2 text-sm font-bold text-white">Design</span>
        </div>
        <div className="absolute left-1/2 top-[54%] h-36 w-44 -translate-x-1/2 -translate-y-1/2 rounded-b-[28px] rounded-t-[18px] bg-[#111827] shadow-[0_18px_40px_rgba(15,23,42,0.24)] transition duration-300 group-hover:scale-[1.03]">
          <div className="absolute -left-12 top-4 h-16 w-20 rotate-[-14deg] rounded-[22px] bg-[#111827]" />
          <div className="absolute -right-12 top-4 h-16 w-20 rotate-[14deg] rounded-[22px] bg-[#111827]" />
          <div className="absolute left-1/2 top-0 h-7 w-14 -translate-x-1/2 rounded-b-2xl bg-white/20" />
          <div className="absolute left-1/2 top-16 -translate-x-1/2 rounded-md border border-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">
            PRNTD
          </div>
        </div>
        <p className="absolute bottom-6 left-6 right-6 text-sm leading-6 text-[#4b5563]">
          Upload artwork, create a design, preview placement, and send production-ready files through checkout.
        </p>
      </Link>

      <div className="grid gap-5">
        <Link
          href="/products/business-cards"
          className="group relative overflow-hidden rounded-[28px] border border-white/80 bg-white p-6 no-underline shadow-[0_14px_38px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(15,23,42,0.1)] max-md:rounded-3xl"
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#4f46e5]">Business Cards</p>
          <h3 className="mt-2 text-2xl font-black leading-tight text-[#111827]">Front, back, QR, and brand details</h3>
          <div className="mt-7 aspect-[1.75/1] rounded-[22px] border border-[#dbe4f0] bg-[linear-gradient(135deg,#ffffff,#f8fbff)] p-5 shadow-inner transition duration-300 group-hover:rotate-1">
            <div className="h-full rounded-[16px] border-2 border-dashed border-blue-400/70 p-4">
              <div className="h-5 w-28 rounded-full bg-[#111827]" />
              <div className="mt-4 h-3 w-40 rounded-full bg-[#c7d2fe]" />
              <div className="mt-2 h-3 w-28 rounded-full bg-[#dbeafe]" />
            </div>
          </div>
        </Link>

        <Link
          href="/products/die-cut-stickers"
          className="group relative overflow-hidden rounded-[28px] border border-white/80 bg-white p-6 no-underline shadow-[0_14px_38px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(15,23,42,0.1)] max-md:rounded-3xl"
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#4f46e5]">Stickers</p>
          <h3 className="mt-2 text-2xl font-black leading-tight text-[#111827]">Transparent previews, glossy or matte</h3>
          <div className="mt-7 flex items-end gap-3">
            <div className="h-20 w-20 rotate-[-8deg] rounded-[24px] bg-[#0f7490] shadow-[0_12px_22px_rgba(15,116,144,0.25)] transition group-hover:rotate-[-2deg]" />
            <div className="h-24 w-24 rounded-[28px] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.16)] transition group-hover:-translate-y-1" />
            <div className="h-20 w-20 rotate-[8deg] rounded-[24px] bg-[#f97316] shadow-[0_12px_22px_rgba(249,115,22,0.2)] transition group-hover:rotate-[2deg]" />
          </div>
        </Link>
      </div>
    </div>
  );
}

function ToolCardView({ card }: { card: ToolCard }) {
  return (
    <article
      className={`rounded-[28px] border border-white/70 bg-white/95 p-[34px] text-center shadow-[0_10px_28px_rgba(0,0,0,0.05)] transition hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(0,0,0,0.06)] max-md:rounded-[22px] max-md:p-[26px_22px] max-md:shadow-[0_5px_16px_rgba(0,0,0,0.045)] max-md:hover:translate-y-0 ${
        card.isCentered ? "min-[901px]:col-start-2" : ""
      }`}
    >
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
    <article className="min-h-60 rounded-[28px] border border-white/70 bg-white/95 p-[34px] text-center shadow-[0_10px_28px_rgba(0,0,0,0.05)] transition hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(0,0,0,0.06)] max-md:rounded-[22px] max-md:p-[26px_22px] max-md:shadow-[0_5px_16px_rgba(0,0,0,0.045)] max-md:hover:translate-y-0">
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
    <div className="w-full bg-[#f5f7fb] text-[#111827]">
      <section className="px-0 pb-[34px] pt-16 max-md:pb-9 max-md:pt-14">
        <div className="mx-auto max-w-7xl px-[22px]">
          <div className="mx-auto max-w-[980px] text-center">
            <div className="mb-7 inline-flex items-center justify-center rounded-full border border-[#dde5ff] bg-[linear-gradient(135deg,#eef4ff_0%,#eef2ff_45%,#f5f3ff_100%)] px-[18px] py-2.5 text-[13px] font-bold text-[#4f46e5]">
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
            <ProductPreviewRail />
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
