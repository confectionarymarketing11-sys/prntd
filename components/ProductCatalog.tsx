import Link from "next/link";
import ProductMockup from "@/components/ProductMockup";
import { formatMoney, shopProducts } from "@/data/shop";

export default function ProductCatalog() {
  return (
    <section className="bg-[#f5f7fb] px-5 py-[55px] pb-[90px]">
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="mb-[42px] text-center">
          <div className="mb-7 inline-flex rounded-full border border-[#dde5ff] bg-[linear-gradient(135deg,#eef4ff_0%,#eef2ff_45%,#f5f3ff_100%)] px-[18px] py-2.5 text-[13px] font-bold text-[#4f46e5]">
            Premium Print Products
          </div>
          <h1 className="text-[clamp(42px,5vw,70px)] font-extrabold leading-[1.02] tracking-normal text-[#111827]">
            Product Showcase
          </h1>
          <p className="mx-auto mt-4 max-w-[760px] text-lg leading-[1.75] text-[#6b7280]">
            Choose apparel, stickers, labels, and paper goods, then personalize them with PRNTD creative tools.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {shopProducts.map((product) => (
            <article
              key={product.id}
              className="prntd-glass overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(0,0,0,0.07)]"
            >
              <ProductMockup product={product} />
              <div className="flex min-h-80 flex-col gap-4 p-[26px]">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="rounded-full bg-[linear-gradient(135deg,#eef4ff_0%,#eef2ff_45%,#f5f3ff_100%)] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#4338ca]">
                      {product.category}
                    </p>
                    <p className="text-lg font-black">{formatMoney(product.basePrice)}+</p>
                  </div>
                  <h2 className="mt-5 text-[28px] font-extrabold leading-[1.15] tracking-normal">{product.name}</h2>
                  <p className="mt-3 text-[15px] leading-7 text-[#4b5563]">{product.description}</p>
                </div>
                <div className="mt-auto grid gap-4">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-[#6b7280]">Colors</p>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <span
                          key={color.name}
                          className="h-6 w-6 rounded-full border border-stone-300 shadow-sm"
                          style={{ background: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold text-[#6b7280]">
                    <span className="rounded-2xl bg-[#f9fafb] px-3 py-2">{product.productionDays}</span>
                    <span className="rounded-2xl bg-[#f9fafb] px-3 py-2">Min {product.minimumQuantity}</span>
                  </div>
                  <Link href={`/products/${product.id}`} className="design-main-btn !mt-0">
                    View Product
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
