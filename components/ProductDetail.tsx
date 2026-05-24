"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import ProductMockup from "@/components/ProductMockup";
import {
  CartItem,
  DesignLayer,
  Product,
  formatMoney,
  priceDesign,
  roundMoney,
} from "@/data/shop";
import type { Review } from "@/features/reviews/data/reviews";
import { addCartItem } from "@/lib/cart-storage";
import { trackStorefrontEvent } from "@/lib/storefront-analytics";

type StoredDesign = {
  image?: string;
  designId?: string;
  designPath?: string;
  type?: string;
};

const productFeatures: Record<string, string[]> = {
  "classic-tee": [
    "Premium soft cotton finish",
    "Front and back print-ready",
    "Perfect for merch and brands",
  ],
  "die-cut-stickers": [
    "Waterproof premium vinyl",
    "Scratch resistant coating",
    "Long-lasting vibrant colors",
  ],
  "business-cards": [
    "Luxury business finish",
    "Double-sided print support",
    "Professional networking quality",
  ],
};

const checkerboardBackground = {
  backgroundColor: "#ffffff",
  backgroundImage:
    "linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)",
  backgroundSize: "24px 24px",
  backgroundPosition: "0 0,0 12px,12px -12px,-12px 0",
};

function compressUpload(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const maxSize = 1400;
        const scale = Math.min(
          1,
          maxSize / Math.max(image.width, image.height),
        );

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Unable to prepare image."));
          return;
        }

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/webp", 0.92));
      };

      image.onerror = reject;
      image.src = String(reader.result ?? "");
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProductDetail({
  product,
  reviews = [],
}: {
  product: Product;
  reviews?: Review[];
}) {
  const isSticker =
    product.id === "die-cut-stickers";

  const isBusinessCard =
    product.id === "business-cards";

  const defaultStickerVariant =
    isSticker
      ? product.stickerVariants?.[0] ?? null
      : null;

  const defaultBusinessCardVariant =
    isBusinessCard
      ? product.businessCardVariants?.[1] ??
        product.businessCardVariants?.[0] ??
        null
      : null;

  const [selectedSize, setSelectedSize] = useState(
    defaultStickerVariant?.size ??
      defaultBusinessCardVariant?.size ??
      product.sizes[0] ??
      "",
  );

  const [selectedColor, setSelectedColor] = useState(
    product.colors[0],
  );

  const [quantity, setQuantity] = useState(
    defaultStickerVariant?.quantity ??
      defaultBusinessCardVariant?.quantity ??
      product.minimumQuantity,
  );

  const [selectedStickerVariant, setSelectedStickerVariant] =
    useState(defaultStickerVariant);

  const [selectedBusinessCardVariant, setSelectedBusinessCardVariant] =
    useState(defaultBusinessCardVariant);

  const [design, setDesign] =
    useState<StoredDesign | null>(null);

  const [uploadedDesign, setUploadedDesign] = useState("");

  const [status, setStatus] = useState("");

  const [reviewStatus, setReviewStatus] = useState("");

  const [adminBasePrice, setAdminBasePrice] = useState(
    product.basePrice,
  );

  const designPreview =
    uploadedDesign || design?.image || "";

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

  const pricedProduct = useMemo(
    () => ({
      ...product,
      basePrice: adminBasePrice,
    }),
    [adminBasePrice, product],
  );

  const price = useMemo(() => {
    if (isSticker && selectedStickerVariant) {
      return {
        unitPrice: roundMoney(
          selectedStickerVariant.price /
            selectedStickerVariant.quantity,
        ),
        lineTotal: selectedStickerVariant.price,
        printType: selectedStickerVariant.label,
      };
    }

    if (
      isBusinessCard &&
      selectedBusinessCardVariant
    ) {
      const hasCustomDesign = Boolean(designPreview);
      const designFee =
        hasCustomDesign &&
        selectedBusinessCardVariant.quantity > 1
          ? product.designFee ?? 0
          : 0;
      const lineTotal = roundMoney(
        selectedBusinessCardVariant.price +
          designFee,
      );

      return {
        unitPrice: roundMoney(
          lineTotal /
            selectedBusinessCardVariant.quantity,
        ),
        lineTotal,
        printType: hasCustomDesign
          ? "Custom business cards"
          : selectedBusinessCardVariant.label,
      };
    }

    return priceDesign(
      pricedProduct,
      quantity,
      frontLayers,
      [],
    );
  }, [
    isSticker,
    isBusinessCard,
    selectedStickerVariant,
    selectedBusinessCardVariant,
    product.designFee,
    designPreview,
    pricedProduct,
    quantity,
    frontLayers,
  ]);

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

  useEffect(() => {
    let active = true;

    fetch("/api/products/pricing")
      .then((response) => response.json())
      .then(
        (
          pricing: Record<
            string,
            { price?: number }
          >,
        ) => {
          const nextPrice =
            pricing[product.id]?.price;

          if (
            active &&
            typeof nextPrice === "number" &&
            nextPrice > 0
          ) {
            setAdminBasePrice(nextPrice);
          }
        },
      )
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [product.id]);

  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setStatus("Preparing artwork...");

      const preparedImage =
        await compressUpload(file);

      setUploadedDesign(preparedImage);

      setStatus("Artwork attached.");
    } catch {
      setStatus(
        "Could not process that image.",
      );
    } finally {
      event.target.value = "";
    }
  }

  function removeDesign() {
    setDesign(null);
    setUploadedDesign("");
    localStorage.removeItem("prntd_design");

    setStatus("Design removed.");
  }

  function openCustomizer() {
    if (designPreview) {
      localStorage.setItem(
        "prntd_generated_image",
        designPreview,
      );
    }

    window.location.href = isBusinessCard
      ? `/business-card-designer?product=${encodeURIComponent(
          product.id,
        )}`
      : `/designer?product=${encodeURIComponent(
          product.id,
        )}`;
  }

  async function addToCart() {
    try {
      const item: CartItem = {
        id: crypto.randomUUID(),
        productId: product.id,
        productName: designPreview
          ? `Custom ${product.name}`
          : product.name,
        size:
          selectedStickerVariant?.label ??
          selectedBusinessCardVariant?.label ??
          selectedSize,
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

      setStatus("Adding to cart...");

      await addCartItem(item);

      trackStorefrontEvent("added_to_cart", {
        product_id: product.id,
        product_name: product.name,
        quantity,
        line_total: price.lineTotal,
      });

      window.location.href = "/cart";
    } catch {
      setStatus("Could not add item.");
    }
  }

  async function submitReview(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const form = event.currentTarget;

    const formData = new FormData(form);

    setReviewStatus("Submitting review...");

    try {
      const response = await fetch(
        "/api/reviews",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            productId: product.id,
            customerName: String(
              formData.get("customerName") ??
                "",
            ),
            customerEmail: String(
              formData.get("customerEmail") ??
                "",
            ),
            rating: Number(
              formData.get("rating") ?? 5,
            ),
            title: String(
              formData.get("title") ?? "",
            ),
            body: String(
              formData.get("body") ?? "",
            ),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Review failed",
        );
      }

      form.reset();

      setReviewStatus(
        data.message ??
          "Review submitted.",
      );
    } catch (error) {
      setReviewStatus(
        error instanceof Error
          ? error.message
          : "Review failed.",
      );
    }
  }

  return (
    <section className="relative overflow-x-hidden bg-[#020617] px-4 py-6 text-white sm:px-5 sm:py-10">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[#4f46e5]/20 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#2563eb]/20 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] gap-6 lg:grid-cols-[minmax(0,1fr)_460px] sm:gap-8">
        {/* LEFT */}
        <div className="grid gap-5">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.45)] sm:rounded-[36px]">
            <ProductMockup
              product={product}
              label={
                designPreview
                  ? "YOUR DESIGN"
                  : product.name
              }
            />
          </div>

          <div
            className={`grid gap-5 ${
              isSticker
                ? ""
                : "sm:grid-cols-2"
            }`}
          >
            {!isSticker && (
              <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:rounded-[28px]">
                <ProductMockup
                  product={product}
                  color={
                    product.colors[1]?.value ??
                    selectedColor.value
                  }
                  label="PRINT"
                />
              </div>
            )}

            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:rounded-[28px] sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#818cf8]">
                Production
              </p>

              <h2 className="mt-3 text-4xl font-black">
                {product.productionDays}
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#94a3b8]">
                Built for premium print
                production with high-quality
                finishing and fast turnaround.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <aside className="h-fit rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.5)] sm:rounded-[36px] sm:p-7 lg:sticky lg:top-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#818cf8]">
            {product.category}
          </p>

          <h1 className="mt-4 text-[clamp(34px,12vw,72px)] font-black leading-[0.98] tracking-[-0.035em] sm:leading-[0.95] sm:tracking-[-0.04em]">
            {product.name}
          </h1>

          <p className="mt-5 text-[15px] leading-8 text-[#94a3b8]">
            {product.description}
          </p>

          {/* DESIGN BOX */}
          <div className="mt-8 rounded-[28px] border border-white/10 bg-[#0f172a]/80 p-5">
            <p className="text-sm font-black">
              Your Design
            </p>

            {designPreview ? (
              <div className="mt-4">
                <img
                  src={designPreview}
                  alt="Preview"
                  className="max-h-[260px] w-full rounded-[20px] border border-white/10 bg-white object-contain p-4"
                  style={
                    isSticker
                      ? checkerboardBackground
                      : undefined
                  }
                />

                <button
                  type="button"
                  onClick={removeDesign}
                  className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black transition hover:bg-white/10"
                >
                  Remove Design
                </button>
              </div>
            ) : (
              <>
                <p className="mt-2 text-sm leading-7 text-[#94a3b8]">
                  Upload artwork or attach a
                  saved design before adding
                  to cart.
                </p>

                <label className="mt-5 flex cursor-pointer items-center justify-center rounded-[22px] border-2 border-dashed border-[#6366f1]/40 bg-white/[0.03] px-5 py-6 text-center text-sm font-black text-[#c7d2fe] transition hover:bg-white/[0.06]">
                  Upload Artwork

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleUpload}
                    className="hidden"
                  />
                </label>
              </>
            )}
          </div>

          {/* OPTIONS */}
          <div className="mt-6 grid gap-5">
            {isSticker && product.stickerVariants?.length ? (
              <>
                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                    Sticker Pack
                  </span>

                  <select
                    value={selectedStickerVariant?.label ?? ""}
                    onChange={(event) => {
                      const next =
                        product.stickerVariants?.find(
                          (variant) =>
                            variant.label ===
                            event.target.value,
                        ) ?? null;

                      setSelectedStickerVariant(next);

                      if (next) {
                        setQuantity(next.quantity);
                        setSelectedSize(next.size);
                      }
                    }}
                    className="rounded-2xl border border-white/10 bg-[#0f172a] px-5 py-4 text-white outline-none"
                  >
                    {product.stickerVariants.map(
                      (variant) => (
                        <option
                          key={variant.label}
                          value={variant.label}
                        >
                          {variant.label} -{" "}
                          {formatMoney(variant.price)}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                    Material Finish
                  </span>

                  <select
                    value={selectedColor.name}
                    onChange={(event) => {
                      const next =
                        product.colors.find(
                          (color) =>
                            color.name ===
                            event.target.value,
                        ) ?? product.colors[0];

                      setSelectedColor(next);
                    }}
                    className="rounded-2xl border border-white/10 bg-[#0f172a] px-5 py-4 text-white outline-none"
                  >
                    {product.colors.map((color) => (
                      <option
                        key={color.name}
                        value={color.name}
                      >
                        {color.name}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : isBusinessCard &&
              product.businessCardVariants?.length ? (
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                  Card Quantity
                </span>

                <select
                  value={selectedBusinessCardVariant?.label ?? ""}
                  onChange={(event) => {
                    const next =
                      product.businessCardVariants?.find(
                        (variant) =>
                          variant.label === event.target.value,
                      ) ?? null;

                    setSelectedBusinessCardVariant(next);

                    if (next) {
                      setQuantity(next.quantity);
                      setSelectedSize(next.size);
                    }
                  }}
                  className="rounded-2xl border border-white/10 bg-[#0f172a] px-5 py-4 text-white outline-none"
                >
                  {product.businessCardVariants.map(
                    (variant) => (
                      <option
                        key={variant.label}
                        value={variant.label}
                      >
                        {variant.label} -{" "}
                        {formatMoney(variant.price)}
                      </option>
                    ),
                  )}
                </select>
              </label>
            ) : !isBusinessCard ? (
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                  Size
                </span>

                <select
                  value={selectedSize}
                  onChange={(event) =>
                    setSelectedSize(
                      event.target.value,
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-[#0f172a] px-5 py-4 text-white outline-none"
                >
                  {product.sizes.map(
                    (size) => (
                      <option
                        key={size}
                        value={size}
                      >
                        {size}
                      </option>
                    ),
                  )}
                </select>
              </label>
            ) : null}

            {!isSticker && !isBusinessCard ? (
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                  Quantity
                </span>

                <input
                  value={quantity}
                  type="number"
                  min={product.minimumQuantity}
                  onChange={(event) =>
                    setQuantity(
                      Math.max(
                        product.minimumQuantity,
                        Number(
                          event.target.value,
                        ) ||
                          product.minimumQuantity,
                      ),
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-[#0f172a] px-5 py-4 text-white outline-none"
                />
              </label>
            ) : null}
          </div>

          {/* PRICE */}
          <div className="mt-7 overflow-hidden rounded-[30px] border border-[#6366f1]/30 bg-[linear-gradient(135deg,#1e293b_0%,#312e81_100%)] p-6 shadow-[0_20px_60px_rgba(79,70,229,0.35)]">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-[#c7d2fe]">
              Estimated Total
            </p>

            <p className="mt-3 text-[clamp(38px,13vw,52px)] font-black leading-none">
              {formatMoney(price.lineTotal)}
            </p>

            <p className="mt-2 text-sm text-[#cbd5e1]">
              {formatMoney(price.unitPrice)} each
            </p>
          </div>

          {/* ACTIONS */}
          <div className="mt-7 grid gap-3">
            {!isSticker && (
              <button
                type="button"
                onClick={openCustomizer}
                className="rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] px-5 py-4 text-sm font-black text-white shadow-[0_12px_40px_rgba(99,102,241,0.45)] transition hover:-translate-y-1"
              >
                {isBusinessCard
                  ? "Customize Business Card"
                  : "Customize Product"}
              </button>
            )}

            <button
              type="button"
              onClick={addToCart}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-black text-white transition hover:bg-white/[0.08]"
            >
              Add To Cart
            </button>

            <Link
              href="/design-generator"
              className="rounded-2xl border border-white/10 bg-[#0f172a] px-5 py-4 text-center text-sm font-black text-white no-underline transition hover:bg-[#111827]"
            >
              Create New Design
            </Link>
          </div>

          {/* FEATURES */}
          <ul className="mt-8 grid gap-3">
            {(productFeatures[
              product.id
            ] ?? []).map((feature) => (
              <li
                key={feature}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm font-semibold text-[#cbd5e1]"
              >
                ✦ {feature}
              </li>
            ))}
          </ul>

          {/* REVIEWS */}
          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-lg font-black">
              Customer Reviews
            </p>

            <div className="mt-5 grid gap-4">
              {reviews.length ? (
                reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-[22px] border border-white/10 bg-[#0f172a]/80 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-black">
                        {review.title ||
                          "PRNTD customer"}
                      </p>

                      <p className="text-sm font-black text-[#818cf8]">
                        {review.rating}/5
                      </p>
                    </div>

                    <p className="mt-3 text-sm leading-7 text-[#cbd5e1]">
                      {review.body}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-[#94a3b8]">
                  Reviews will appear here.
                </p>
              )}
            </div>

            {/* REVIEW FORM */}
            <form
              onSubmit={submitReview}
              className="mt-6 grid gap-4"
            >
              <input
                name="customerName"
                required
                placeholder="Name"
                className="rounded-2xl border border-white/10 bg-[#0f172a] px-5 py-4 text-white outline-none"
              />

              <textarea
                name="body"
                required
                rows={4}
                placeholder="Tell us what you thought"
                className="rounded-2xl border border-white/10 bg-[#0f172a] px-5 py-4 text-white outline-none"
              />

              <button
                type="submit"
                className="rounded-2xl bg-white px-5 py-4 text-sm font-black text-black transition hover:opacity-90"
              >
                Submit Review
              </button>

              {reviewStatus && (
                <p className="text-sm font-semibold text-[#818cf8]">
                  {reviewStatus}
                </p>
              )}
            </form>
          </div>

          {status && (
            <p className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-semibold text-[#cbd5e1]">
              {status}
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
