import Link from "next/link";

type ProductCard = {
  title: string;
  description: string;
  href: string;
  action: string;
};

const products: ProductCard[] = [
  {
    title: "Custom Apparel",
    description:
      "Premium t-shirts, hoodies, and branded apparel printed for businesses, creators, teams, and events.",
    href: "/products",
    action: "Shop Apparel",
  },

  {
    title: "Business Cards",
    description:
      "Modern business cards, marketing materials, and print assets designed to elevate your brand.",
    href: "/products",
    action: "Browse Cards",
  },

  {
    title: "Custom Stickers",
    description:
      "Durable die-cut stickers, labels, and branded packaging assets for products and promotions.",
    href: "/products",
    action: "Shop Stickers",
  },

  {
    title: "Online Design Tools",
    description:
      "Create artwork, remove backgrounds, generate QR codes, and manage your designs online.",
    href: "/design-generator",
    action: "Open Design Tools",
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
      className="inline-flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#7c3aed_100%)] px-7 py-4 text-sm font-black text-white no-underline shadow-[0_10px_30px_rgba(99,102,241,0.35)] transition duration-200 hover:-translate-y-1 sm:w-auto"
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
      className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black text-white no-underline backdrop-blur transition duration-200 hover:-translate-y-1 hover:bg-white/10 sm:w-auto"
    >
      {children}
    </Link>
  );
}

function ProductCardView({
  card,
}: {
  card: ProductCard;
}) {
  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#6366f1]/40 hover:bg-white/[0.06] hover:shadow-[0_20px_60px_rgba(79,70,229,0.18)]">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,#3b82f6,#6366f1,#7c3aed)] opacity-0 transition group-hover:opacity-100" />

      <h3 className="text-3xl font-black tracking-[-0.03em] text-white">
        {card.title}
      </h3>

      <p className="mt-5 text-[15px] leading-8 text-[#cbd5e1]">
        {card.description}
      </p>

      <div className="mt-8">
        <PrimaryButton href={card.href}>
          {card.action}
        </PrimaryButton>
      </div>
    </article>
  );
}

export default function PrntdToolsLanding() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[#4f46e5]/25 blur-[140px]" />

        <div className="absolute bottom-[-15%] right-[-10%] h-[600px] w-[600px] rounded-full bg-[#2563eb]/20 blur-[160px]" />
      </div>

      {/* HERO */}
<section className="relative z-10 px-5 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32">
  <div className="mx-auto max-w-7xl">
    <div className="mx-auto max-w-5xl text-center">
      <div className="inline-flex items-center rounded-full border border-[#6366f1]/30 bg-white/5 px-5 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#a5b4fc] backdrop-blur">
        Premium Custom Printing
      </div>

      <h1 className="mt-10 flex flex-col items-center text-center font-black leading-none text-white">
  <span className="text-[clamp(46px,8vw,92px)] tracking-[-0.05em]">
    Premium
  </span>

  <span className="mt-2 bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-[clamp(54px,10vw,118px)] tracking-[-0.06em] text-transparent">
    Custom Printing
  </span>
</h1>

      <p className="mx-auto mt-10 max-w-[820px] text-lg leading-9 text-[#94a3b8] sm:text-[21px]">
        Apparel, stickers, business cards, labels, and branded print
        products powered by modern online design tools.
      </p>

      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <PrimaryButton href="/products">
          Shop Products
        </PrimaryButton>

        <SecondaryButton href="/design-generator">
          Start Designing
        </SecondaryButton>
      </div>
    </div>
  </div>
</section>

      {/* FEATURE STRIP */}
      <section className="relative z-10 px-5 pb-16 sm:px-6 sm:pb-20">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {[
            [
              "Premium Print Quality",
              "High-quality apparel, stickers, cards, and branding products.",
            ],

            [
              "Easy Online Design",
              "Create and customize products directly from your browser.",
            ],

            [
              "Built For Brands",
              "Perfect for creators, startups, events, restaurants, and businesses.",
            ],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="rounded-[28px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl"
            >
              <h3 className="text-xl font-black text-white">
                {title}
              </h3>

              <p className="mt-4 text-[15px] leading-8 text-[#94a3b8]">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS + TOOLS */}
      <section className="relative z-10 px-5 pb-20 sm:px-6 sm:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <h2 className="text-[clamp(38px,8vw,72px)] font-black leading-[0.95] tracking-[-0.04em]">
              Print Products &
              <span className="block text-[#a5b4fc]">
                Smart Design Tools
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-[760px] text-lg leading-8 text-[#94a3b8]">
              Everything you need to design, customize, and order premium
              branded products from one modern platform.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
            {products.map((card) => (
              <ProductCardView
                key={card.title}
                card={card}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-5 pb-24 sm:px-6 sm:pb-32">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#111827_40%,#312e81_100%)] px-6 py-16 text-center shadow-[0_25px_90px_rgba(0,0,0,0.45)] sm:px-12 sm:py-24">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.35),transparent_45%)]" />

            <div className="relative z-10">
              <h2 className="text-[clamp(40px,10vw,82px)] font-black leading-[0.95] tracking-[-0.05em]">
                Start Building
                <span className="block text-[#a5b4fc]">
                  With PRNTD
                </span>
              </h2>

              <p className="mx-auto mt-8 max-w-[760px] text-lg leading-8 text-[#cbd5e1]">
                Professional custom printing and modern online design tools for
                businesses, creators, and growing brands.
              </p>

              <div className="mt-12 flex flex-wrap justify-center gap-4">
                <PrimaryButton href="/products">
                  Shop Products
                </PrimaryButton>

                <SecondaryButton href="/signup">
                  Create Account
                </SecondaryButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}