import { Product } from "@/data/shop";

type ProductMockupProps = {
  product: Product;
  color?: string;
  label?: string;
};

export default function ProductMockup({ product, color, label }: ProductMockupProps) {
  const fill = color ?? product.colors[0]?.value ?? "#111111";

  if (product.id === "die-cut-stickers") {
    return (
      <div className="mockup-surface">
        <div className="sticker-stack" aria-hidden="true">
          <span style={{ background: fill }} />
          <span />
          <span />
        </div>
        <span className="mockup-label">{label ?? product.name}</span>
      </div>
    );
  }

  if (product.id === "poster-print") {
    return (
      <div className="mockup-surface">
        <div className="poster-mockup" aria-hidden="true" style={{ background: fill }}>
          <span />
          <strong>{label ?? "ART"}</strong>
        </div>
      </div>
    );
  }

  if (product.id === "business-cards") {
    return (
      <div className="mockup-surface">
        <div
          aria-hidden="true"
          className="grid h-36 w-60 place-items-center rounded-2xl border border-white/80 shadow-[0_18px_35px_rgba(15,23,42,0.18)]"
          style={{ background: fill }}
        >
          <div className="rounded border border-current/25 px-5 py-2 text-sm font-black uppercase tracking-[0.18em] text-current">
            {label ?? "PRNTD"}
          </div>
        </div>
      </div>
    );
  }

  if (product.id === "premium-hoodie") {
    return (
      <div className="mockup-surface">
        <div className="hoodie-mockup" aria-hidden="true" style={{ background: fill }}>
          <span />
          <strong>{label ?? "PRINT"}</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="mockup-surface">
      <div className="tee-mockup" aria-hidden="true" style={{ background: fill }}>
        <span />
        <strong>{label ?? "PRINT"}</strong>
      </div>
    </div>
  );
}
