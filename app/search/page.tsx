import Link from "next/link";

import ShopHeader from "@/components/ShopHeader";

import { shopProducts } from "@/data/shop";

const tools = [
  {
    title: "Design Tools",
    href: "/design-tools",
    keywords:
      "design creator image editor background remover",
  },
  {
    title: "Image Editor",
    href: "/edit-design",
    keywords:
      "edit image ai image editor",
  },
  {
    title: "QR Manager",
    href: "/qr-dashboard",
    keywords:
      "qr code dynamic free static qr",
  },
  {
    title: "Customer Portal",
    href: "/dashboard",
    keywords:
      "account orders credits subscription",
  },
  {
    title: "Contact",
    href: "/contact",
    keywords:
      "help email support",
  },
  {
    title: "Policies",
    href: "/policies",
    keywords:
      "terms privacy refund shipping",
  },
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
  }>;
}) {
  const params =
    await searchParams;

  const query = (
    params.q ?? ""
  )
    .trim()
    .toLowerCase();

  const productResults =
    shopProducts.filter(
      (product) => {
        if (!query)
          return true;

        return `${product.name} ${product.category} ${product.description}`
          .toLowerCase()
          .includes(query);
      },
    );

  const toolResults =
    tools.filter(
      (tool) =>
        !query ||
        `${tool.title} ${tool.keywords}`
          .toLowerCase()
          .includes(query),
    );

  const results = [
    ...productResults.map(
      (product) => ({
        title:
          product.name,
        href: `/products/${product.id}`,
        detail:
          product.description,
      }),
    ),

    ...toolResults.map(
      (tool) => ({
        title:
          tool.title,
        href: tool.href,
        detail:
          tool.keywords,
      }),
    ),
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* BG */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[#4f46e5]/15 blur-[140px]" />

        <div className="absolute bottom-[-10%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[#2563eb]/15 blur-[140px]" />
      </div>

      <div className="relative z-10">
        <ShopHeader />

        <section className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-12">
          {/* HERO */}
          <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#1e1b4b_100%)] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] sm:p-10">
            <div className="absolute right-[-10%] top-[-20%] h-[280px] w-[280px] rounded-full bg-[#6366f1]/20 blur-[90px]" />

            <div className="relative z-10">
              <p className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#c7d2fe]">
                PRNTD Search
              </p>

              <h1 className="mt-5 text-[clamp(42px,5vw,72px)] font-black leading-[0.92] tracking-[-0.06em]">
                Search
                <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                  Everything
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-[#cbd5e1]">
                Search products,
                design tools,
                customer features,
                policies, and
                platform resources.
              </p>

              {/* SEARCH */}
              <form className="mt-8 flex flex-col gap-3 sm:flex-row">
                <input
                  name="q"
                  defaultValue={
                    params.q ??
                    ""
                  }
                  placeholder="Search products, tools, policies..."
                  className="min-w-0 flex-1 rounded-[20px] border border-white/10 bg-[#020617] px-5 py-4 text-base text-white outline-none placeholder:text-[#64748b]"
                />

                <button className="rounded-[20px] bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_40px_rgba(99,102,241,0.35)]">
                  Search
                </button>
              </form>
            </div>
          </div>

          {/* RESULTS */}
          <div className="grid gap-5 md:grid-cols-2">
            {results.map(
              (result) => (
                <Link
                  key={
                    result.href
                  }
                  href={
                    result.href
                  }
                  className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-[#0f172a]/80 p-7 text-white no-underline shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20"
                >
                  {/* GLOW */}
                  <div className="absolute right-[-20%] top-[-20%] h-[180px] w-[180px] rounded-full bg-[#6366f1]/10 blur-[70px] transition group-hover:bg-[#6366f1]/20" />

                  <div className="relative z-10">
                    <p className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#a5b4fc]">
                      Search Result
                    </p>

                    <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white">
                      {
                        result.title
                      }
                    </h2>

                    <p className="mt-4 text-sm leading-7 text-[#cbd5e1]">
                      {
                        result.detail
                      }
                    </p>

                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-[#a5b4fc]">
                      Open Page
                    </div>
                  </div>
                </Link>
              ),
            )}
          </div>

          {/* EMPTY */}
          {!results.length ? (
            <div className="rounded-[30px] border border-white/10 bg-[#0f172a]/80 p-10 text-center shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <h2 className="text-3xl font-black tracking-[-0.04em] text-white">
                No Results Found
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-[#cbd5e1]">
                Try searching for
                products, design
                tools, policies,
                QR features, or
                creator resources.
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}