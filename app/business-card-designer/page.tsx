"use client";

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";
import ShopHeader from "@/components/ShopHeader";
import {
  CART_STORAGE_KEY,
  CartItem,
  DesignLayer,
  formatMoney,
  getProduct,
  priceDesign,
} from "@/data/shop";

const fonts = ["Arial", "Impact", "Helvetica", "Verdana", "Georgia", "Times New Roman", "Courier New"];
const sides = ["front", "back"] as const;
type CardSide = (typeof sides)[number];

function sideHasContent(layers: DesignLayer[]) {
  return layers.some((layer) => layer.type === "image" || Boolean(layer.text?.trim()));
}

export default function BusinessCardDesignerPage() {
  const product = getProduct("business-cards");
  const [side, setSide] = useState<CardSide>("front");
  const [frontLayers, setFrontLayers] = useState<DesignLayer[]>([]);
  const [backLayers, setBackLayers] = useState<DesignLayer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#111111");
  const [quantity, setQuantity] = useState(product.minimumQuantity);
  const [size, setSize] = useState(product.sizes[0] ?? "Standard");
  const [finish, setFinish] = useState(product.colors[0]);
  const [notice, setNotice] = useState("Keep all artwork inside the card edge.");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const layers = side === "front" ? frontLayers : backLayers;
  const selectedLayer = layers.find((layer) => layer.id === selectedId);
  const selectedTextLayer = selectedLayer?.type === "text" ? selectedLayer : null;
  const price = useMemo(() => priceDesign(product, quantity, frontLayers, backLayers), [product, quantity, frontLayers, backLayers]);

  function setCurrentLayers(nextLayers: DesignLayer[]) {
    if (side === "front") {
      setFrontLayers(nextLayers);
    } else {
      setBackLayers(nextLayers);
    }
  }

  function updateLayer(id: string, updates: Partial<DesignLayer>) {
    const next = layers.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer));
    setCurrentLayers(next);
  }

  function addText() {
    const nextLayer: DesignLayer = {
      id: crypto.randomUUID(),
      type: "text",
      text: "Your Name",
      x: 24,
      y: 32,
      fontSize: 22,
      fontFamily,
      fill: textColor,
      rotation: 0,
    };

    setCurrentLayers([...layers, nextLayer]);
    setSelectedId(nextLayer.id);
    setNotice("Text added. Edit the selected text field below.");
  }

  function deleteSelectedLayer() {
    if (!selectedId) return;

    setCurrentLayers(layers.filter((layer) => layer.id !== selectedId));
    setSelectedId(null);
    setNotice("Selected layer removed.");
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const nextLayer: DesignLayer = {
        id: crypto.randomUUID(),
        type: "image",
        preview: String(reader.result ?? ""),
        x: 24,
        y: 24,
        width: 180,
        height: 110,
        rotation: 0,
      };

      setCurrentLayers([...layers, nextLayer]);
      setSelectedId(nextLayer.id);
      setNotice("Image uploaded. It will be attached to this card side.");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function addToCart() {
    const item: CartItem = {
      id: crypto.randomUUID(),
      productId: product.id,
      productName: `Custom ${product.name}`,
      size,
      color: finish,
      quantity,
      frontLayers,
      backLayers,
      unitPrice: price.unitPrice,
      lineTotal: price.lineTotal,
      createdAt: new Date().toISOString(),
    };
    const currentCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]") as CartItem[];
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([...currentCart, item]));
    window.location.href = "/cart";
  }

  async function checkoutNow() {
    setIsCheckingOut(true);
    setNotice("Creating secure checkout...");

    try {
      const response = await fetch("/api/prntd/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productType: "business-cards",
          quantity,
          customization: {
            size,
            finish: finish.name,
            frontLayers,
            backLayers,
          },
          successPath: "/success",
          cancelPath: "/business-card-designer",
        }),
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Checkout failed");
      }

      window.location.href = data.url;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Checkout failed.");
      setIsCheckingOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <ShopHeader />
      <section className="mx-auto w-full max-w-7xl px-[22px] py-10">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] max-[860px]:grid-cols-1">
          <div className="relative rounded-[32px] bg-[#f5f7fb] p-7">
            <div className="mb-[18px] flex gap-2.5">
              {sides.map((cardSide) => (
                <button
                  key={cardSide}
                  type="button"
                  onClick={() => {
                    setSide(cardSide);
                    setSelectedId(null);
                  }}
                  className={`rounded-full px-[18px] py-3 text-sm font-bold capitalize ${
                    side === cardSide ? "bg-[#111827] text-white" : "bg-[#e5e7eb] text-[#111827]"
                  }`}
                >
                  {cardSide}
                </button>
              ))}
            </div>

            <div className="grid min-h-[520px] place-items-center rounded-[28px] bg-[#eef2f7] p-6">
              <div className="relative aspect-[1.75/1] w-full max-w-[760px] overflow-hidden rounded-[26px] border border-white/70 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
                <div className="absolute inset-5 rounded-[20px] border-2 border-dashed border-blue-500/70" />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.08),rgba(124,58,237,0.08))]" />
                {layers.map((layer) => (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => setSelectedId(layer.id)}
                    className={`absolute text-left ${selectedId === layer.id ? "outline outline-2 outline-[#7c3aed]" : ""}`}
                    style={{
                      left: layer.x,
                      top: layer.y,
                      color: layer.fill,
                      fontFamily: layer.fontFamily,
                      fontSize: layer.fontSize,
                    }}
                  >
                    {layer.type === "image" && layer.preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={layer.preview} alt="Uploaded card art" className="max-h-32 max-w-52 object-contain" />
                    ) : (
                      <span>{layer.text}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-4 rounded-[18px] bg-white/80 px-4 py-3 text-sm font-semibold text-[#4b5563] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
              {notice}
            </p>
          </div>

          <aside className="flex flex-col gap-[18px] rounded-[28px] bg-white p-7 shadow-[0_10px_28px_rgba(0,0,0,0.05)]">
            <h1 className="mb-2 text-[48px] font-black leading-[0.92] tracking-[-0.05em] max-[860px]:text-[34px]">
              Customize Business Cards
            </h1>
            <div className="h-px bg-black/5" />

            <label className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">Upload Artwork</label>
            <input className="w-full rounded-[20px] border-2 border-dashed border-indigo-500/20 bg-[#fafbff] p-[18px] text-base" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUpload} />

            <button type="button" onClick={addText} className="prntd-gradient-btn">
              Add Text
            </button>

            <label className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">Font</label>
            <select value={fontFamily} onChange={(event) => setFontFamily(event.target.value)} className="h-[58px] w-full rounded-[18px] border border-slate-950/10 bg-white px-4 text-base">
              {fonts.map((font) => (
                <option key={font}>{font}</option>
              ))}
            </select>

            <label className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">Text Color</label>
            <input type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} className="h-[52px] w-full rounded-2xl border border-slate-950/10 bg-white p-1.5" />

            {selectedTextLayer && (
              <input value={selectedTextLayer.text ?? ""} onChange={(event) => updateLayer(selectedTextLayer.id, { text: event.target.value, fontFamily, fill: textColor })} className="h-[58px] w-full rounded-[18px] border border-slate-950/10 bg-white px-4 text-base" />
            )}

            <button type="button" onClick={deleteSelectedLayer} className="min-h-[54px] rounded-[18px] border border-red-500/15 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              Delete Selected Design
            </button>

            <label className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">Quantity</label>
            <input className="h-[58px] w-full rounded-[18px] border border-slate-950/10 bg-white px-[18px] text-base" type="number" min={product.minimumQuantity} value={quantity} onChange={(event) => setQuantity(Math.max(product.minimumQuantity, Number(event.target.value) || product.minimumQuantity))} />

            <label className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">Size</label>
            <select value={size} onChange={(event) => setSize(event.target.value)} className="h-[58px] w-full rounded-[18px] border border-slate-950/10 bg-white px-4 text-base">
              {product.sizes.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>

            <label className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">Finish</label>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((color) => (
                <button key={color.name} type="button" onClick={() => setFinish(color)} className={`h-11 w-11 rounded-full border-[3px] ${color.name === finish.name ? "border-[#7c3aed]" : "border-transparent"}`} style={{ background: color.value }} title={color.name} />
              ))}
            </div>

            <div className="mt-2 rounded-3xl bg-[#f5f7fb] p-[22px]">
              <p className="text-[15px] font-bold text-[#111827]">Estimated Total</p>
              <p className="mt-1 text-[34px] font-extrabold leading-none text-[#111827]">{formatMoney(price.lineTotal)}</p>
              <p className="mt-2 rounded-[14px] bg-[#eef2ff] px-3.5 py-3 text-[13px] font-semibold text-[#4b5563]">
                {sideHasContent(frontLayers) && sideHasContent(backLayers) ? "Double-sided card design" : "Single-sided card design"}
              </p>
            </div>

            <button type="button" onClick={addToCart} className="prntd-gradient-btn">
              Add To Cart
            </button>
            <button type="button" onClick={checkoutNow} disabled={isCheckingOut} className="prntd-gradient-btn disabled:cursor-not-allowed disabled:opacity-60">
              {isCheckingOut ? "Creating Checkout..." : "Checkout With Stripe"}
            </button>
            <Link href="/products/business-cards" className="rounded-full border border-[#e5e7eb] bg-white px-5 py-4 text-center text-sm font-extrabold text-[#111827] no-underline">
              Back To Product
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
