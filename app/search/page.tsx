import Link from "next/link";
import ShopHeader from "@/components/ShopHeader";
import { shopProducts } from "@/data/shop";

const tools = [
  { title: "Design Tools", href: "/design-tools", keywords: "design creator image editor background remover" },
  { title: "Image Editor", href: "/edit-design", keywords: "edit image ai image editor" },
  { title: "QR Manager", href: "/qr-dashboard", keywords: "qr code dynamic free static qr" },
  { title: "Customer Portal", href: "/dashboard", keywords: "account orders credits subscription" },
  { title: "Contact", href: "/contact", keywords: "help email support" },
  { title: "Policies", href: "/policies", keywords: "terms privacy refund shipping" },
];

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = (params.q ?? "").trim().toLowerCase();
  const productResults = shopProducts.filter((product) => {
    if (!query) return true;
    return `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query);
  });
  const toolResults = tools.filter((tool) => !query || `${tool.title} ${tool.keywords}`.toLowerCase().includes(query));

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <ShopHeader />
      <section className="mx-auto grid w-full max-w-5xl gap-6 px-5 py-12">
        <div className="rounded-[30px] border border-white/70 bg-white p-8 shadow-[0_12px_38px_rgba(0,0,0,0.06)]">
          <h1 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl">Search PRNTD</h1>
          <form className="mt-6 flex gap-2">
            <input name="q" defaultValue={params.q ?? ""} placeholder="Search products, tools, policies..." className="min-w-0 flex-1 rounded-[18px] border border-slate-200 px-4 py-3" />
            <button className="rounded-[18px] bg-slate-950 px-5 py-3 text-sm font-black text-white">Search</button>
          </form>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[...productResults.map((product) => ({ title: product.name, href: `/products/${product.id}`, detail: product.description })), ...toolResults.map((tool) => ({ title: tool.title, href: tool.href, detail: tool.keywords }))].map((result) => (
            <Link key={result.href} href={result.href} className="rounded-[24px] border border-white/70 bg-white p-6 text-[#111827] no-underline shadow-[0_10px_28px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5">
              <h2 className="text-xl font-black">{result.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#6b7280]">{result.detail}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
