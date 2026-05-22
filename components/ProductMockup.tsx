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
