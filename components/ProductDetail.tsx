"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import ProductMockup from "@/components/ProductMockup";
import {
  CART_STORAGE_KEY,
  CartItem,
  DesignLayer,
  Product,
  formatMoney,
  priceDesign,
} from "@/data/shop";
import type { Review } from "@/features/reviews/data/reviews";

type StoredDesign = {
  image?: string;
  designId?: string;
  designPath?: string;
  type?: string;
};

const productFeatures: Record<string, string[]> = {
  "classic-tee": ["Soft cotton feel", "Front and back print-ready", "Best for merch, staff shirts, and events"],
  "die-cut-stickers": ["Durable vinyl material", "Waterproof and weather-resistant", "Vibrant long-lasting color"],
  "business-cards": ["Front and back card design", "Premium business-ready finish", "Built for QR codes and brand details"],
};

export default function ProductDetail({ product, reviews = [] }: { product: Product; reviews?: Review[] }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(product.minimumQuantity);
  const [design, setDesign] = useState<StoredDesign | null>(null);
  const [uploadedDesign, setUploadedDesign] = useState("");
  const [status, setStatus] = useState("");

  const designPreview = uploadedDesign || design?.image || "";
  const isSticker = product.id === "die-cut-stickers";
  const isBusinessCard = product.id === "business-cards";

  const frontLayers = useMemo<DesignLayer[]>(() => {
    if (!designPreview) return [];

    return [
      {
        id: "attached-design",
        type: "image",
        preview: designPreview,
        originalPreview: designPreview,
        x: 140,
        y: 150,
        width: 280,
        height: 280,
        rotation: 0,
      },
    ];
  }, [designPreview]);

  const price = useMemo(() => priceDesign(product, quantity, frontLayers, []), [frontLayers, product, quantity]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const raw = localStorage.getItem("prntd_design");
      if (!raw) return;

      try {
        setDesign(JSON.parse(raw) as StoredDesign);
      } catch {
        setDesign(null);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedDesign(String(reader.result ?? ""));
      setStatus("Design attached to this product.");
    };
    reader.readAsDataURL(file);
  }

  function removeDesign() {
    setDesign(null);
    setUploadedDesign("");
    localStorage.removeItem("prntd_design");
    setStatus("Design removed.");
  }

  function openCustomizer() {
    if (designPreview) {
      localStorage.setItem("prntd_generated_image", designPreview);
    }

    window.location.href = isBusinessCard
      ? `/business-card-designer?product=${encodeURIComponent(product.id)}`
      : `/designer?product=${encodeURIComponent(product.id)}`;
  }

  function addToCart() {
    const item: CartItem = {
      id: crypto.randomUUID(),
      productId: product.id,
      productName: designPreview ? `Custom ${product.name}` : product.name,
      size: selectedSize,
      color: selectedColor,
      quantity,
      frontLayers,
      backLayers: [],
      mockupPreview: designPreview || null,
      frontPreview: designPreview || null,
      backPreview: null,
      unitPrice: price.unitPrice,
      lineTotal: price.lineTotal,
      createdAt: new Date().toISOString(),
    };
    const currentCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]") as CartItem[];

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([...currentCart, item]));
    window.location.href = "/cart";
  }

  return (
    <section className="bg-[#f5f7fb] px-5 py-8 pb-20">
      <div className="mx-auto grid w-full max-w-[1320px] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)]">
        <div className="grid gap-4">
          <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_12px_38px_rgba(0,0,0,0.06)]">
            <ProductMockup product={product} label={designPreview ? "YOUR DESIGN" : product.name} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_10px_28px_rgba(0,0,0,0.045)]">
              <ProductMockup product={product} color={product.colors[1]?.value ?? selectedColor.value} label="PRINT" />
            </div>
            <div className="rounded-[24px] border border-white/70 bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.045)]">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#4f46e5]">Production</p>
              <h2 className="mt-2 text-2xl font-black">{product.productionDays}</h2>
              <p className="mt-3 text-sm leading-6 text-[#6b7280]">
                Minimum quantity {product.minimumQuantity}. Artwork can be uploaded, generated, or built in the product customizer.
              </p>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-[30px] border border-white/70 bg-white p-6 shadow-[0_12px_38px_rgba(0,0,0,0.06)] lg:sticky lg:top-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#4f46e5]">{product.category}</p>
          <h1 className="mt-3 text-[clamp(34px,4vw,52px)] font-black leading-[1.02] tracking-normal">{product.name}</h1>
          <p className="mt-4 text-[15px] leading-7 text-[#6b7280]">{product.description}</p>

          <div className="my-5 h-px bg-[#e5e7eb]" />

          <div className="rounded-[22px] bg-[#f5f7fb] p-5">
            <p className="text-sm font-extrabold text-[#111827]">Your Design</p>
            {designPreview ? (
              <div className="mt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={designPreview}
                  alt="Attached design preview"
                  className="max-h-[260px] w-full rounded-[18px] border border-[#e5e7eb] bg-white object-contain p-3"
                />
                <p className="mt-3 break-words text-xs leading-5 text-[#6b7280]">
                  {design?.designPath ? `Saved design: ${design.designPath}` : "Uploaded design attached locally."}
                </p>
                <button type="button" onClick={removeDesign} className="design-utility-btn mt-3">
                  Remove Design
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm leading-6 text-[#6b7280]">Attach a saved design or upload artwork before adding to cart.</p>
            )}
            <label className="mt-4 block cursor-pointer rounded-[18px] border-2 border-dashed border-[#c7d2fe] bg-white p-4 text-center text-sm font-extrabold text-[#4338ca]">
              Upload Artwork
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUpload} className="hidden" />
            </label>
          </div>

          <div className="mt-5 grid gap-4">
            {!isBusinessCard && (
              <>
                <label className="grid gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">Size</span>
                  <select value={selectedSize} onChange={(event) => setSelectedSize(event.target.value)} className="portal-field">
                    {product.sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>

                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">Color / Finish</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`h-11 w-11 rounded-full border-[3px] ${
                          color.name === selectedColor.name ? "border-[#7c3aed]" : "border-transparent"
                        } shadow-sm`}
                        style={{ background: color.value }}
                        aria-label={color.name}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            <label className="grid gap-2">
              <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">Quantity</span>
              <input
                value={quantity}
                type="number"
                min={product.minimumQuantity}
                onChange={(event) => setQuantity(Math.max(product.minimumQuantity, Number(event.target.value) || product.minimumQuantity))}
                className="portal-field"
              />
            </label>
          </div>

          <div className="my-5 rounded-[22px] bg-[#eef2ff] p-5">
            <p className="text-sm font-bold text-[#4338ca]">Estimated Total</p>
            <p className="mt-1 text-[36px] font-black leading-none">{formatMoney(price.lineTotal)}</p>
            <p className="mt-2 text-sm text-[#6b7280]">{formatMoney(price.unitPrice)} each</p>
          </div>

          <div className="grid gap-2">
            {isSticker ? null : (
              <button type="button" onClick={openCustomizer} className="design-main-btn !mt-0">
                {isBusinessCard ? "Customize Business Card" : "Customize Product"}
              </button>
            )}
            {isSticker ? (
              <button type="button" onClick={addToCart} className="design-main-btn !mt-0">
                Add To Cart
              </button>
            ) : null}
            <Link href="/design-generator" className="rounded-full border border-[#e5e7eb] bg-white px-5 py-4 text-center text-sm font-extrabold text-[#111827] no-underline transition hover:bg-[#f9fafb]">
              Create New Design
            </Link>
          </div>

          <ul className="mt-6 grid gap-2 text-sm leading-6 text-[#4b5563]">
            {(productFeatures[product.id] ?? []).map((feature) => (
              <li key={feature}>✓ {feature}</li>
            ))}
          </ul>

          <div className="mt-6 rounded-[22px] bg-[#f8faff] p-5">
            <p className="text-sm font-black text-[#111827]">Customer Reviews</p>
            <div className="mt-3 grid gap-3">
              {reviews.length ? (
                reviews.map((review) => (
                  <article key={review.id} className="rounded-[18px] border border-[#e7eaf3] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-black">{review.title || "PRNTD customer"}</p>
                      <p className="text-sm font-black text-[#4f46e5]">{review.rating}/5</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#4b5563]">{review.body}</p>
                    <p className="mt-2 text-xs font-bold text-[#6b7280]">{review.customer_name || "Verified customer"}</p>
                  </article>
                ))
              ) : (
                <p className="text-sm leading-6 text-[#6b7280]">Customer reviews will appear here after they are approved in admin.</p>
              )}
            </div>
          </div>

          {status && <p className="mt-4 rounded-[16px] bg-[#f5f7fb] px-4 py-3 text-sm font-semibold text-[#6b7280]">{status}</p>}
        </aside>
      </div>
    </section>
  );
}
