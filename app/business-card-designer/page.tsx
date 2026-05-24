"use client";

import Link from "next/link";
import { ChangeEvent, PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import ShopHeader from "@/components/ShopHeader";
import { trackStorefrontEvent } from "@/lib/storefront-analytics";
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
type DesignerSnapshot = {
  frontLayers: DesignLayer[];
  backLayers: DesignLayer[];
};

function sideHasContent(layers: DesignLayer[]) {
  return layers.some((layer) => layer.type === "image" || Boolean(layer.text?.trim()));
}

async function urlToDataUrl(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function readImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export default function BusinessCardDesignerPage() {
  const product = getProduct("business-cards");
  const [side, setSide] = useState<CardSide>("front");
  const [frontLayers, setFrontLayers] = useState<DesignLayer[]>([]);
  const [backLayers, setBackLayers] = useState<DesignLayer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#111111");
  const [qrValue, setQrValue] = useState("");
  const [quantity, setQuantity] = useState(product.minimumQuantity);
  const [size] = useState(product.sizes[0] ?? "Standard");
  const [finish] = useState(product.colors[0]);
  const [notice, setNotice] = useState("Keep all artwork inside the card edge.");
  const [undoStack, setUndoStack] = useState<DesignerSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<DesignerSnapshot[]>([]);
  const [adminBasePrice, setAdminBasePrice] = useState(product.basePrice);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ layerId: string; offsetX: number; offsetY: number } | null>(null);

  const layers = side === "front" ? frontLayers : backLayers;
  const selectedLayer = layers.find((layer) => layer.id === selectedId);
  const selectedTextLayer = selectedLayer?.type === "text" ? selectedLayer : null;
  const selectedImageLayer = selectedLayer?.type === "image" ? selectedLayer : null;
  const pricedProduct = useMemo(() => ({ ...product, basePrice: adminBasePrice }), [adminBasePrice, product]);
  const price = useMemo(() => priceDesign(pricedProduct, quantity, frontLayers, backLayers), [pricedProduct, quantity, frontLayers, backLayers]);

  useEffect(() => {
    let active = true;

    fetch("/api/products/pricing")
      .then((response) => response.json())
      .then((pricing: Record<string, { price?: number }>) => {
        const nextPrice = pricing[product.id]?.price;
        if (active && typeof nextPrice === "number" && nextPrice > 0) {
          setAdminBasePrice(nextPrice);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [product.id]);

  function currentSnapshot(): DesignerSnapshot {
    return {
      frontLayers,
      backLayers,
    };
  }

  function rememberSnapshot() {
    const snapshot = currentSnapshot();
    setUndoStack((current) => [...current.slice(-24), snapshot]);
    setRedoStack([]);
  }

  function applySnapshot(snapshot: DesignerSnapshot) {
    setFrontLayers(snapshot.frontLayers);
    setBackLayers(snapshot.backLayers);
    setSelectedId(null);
  }

  function undo() {
    const previous = undoStack.at(-1);
    if (!previous) return;

    setUndoStack((current) => current.slice(0, -1));
    setRedoStack((current) => [...current.slice(-24), currentSnapshot()]);
    applySnapshot(previous);
    setNotice("Last customizer action undone.");
  }

  function redo() {
    const next = redoStack.at(-1);
    if (!next) return;

    setRedoStack((current) => current.slice(0, -1));
    setUndoStack((current) => [...current.slice(-24), currentSnapshot()]);
    applySnapshot(next);
    setNotice("Customizer action redone.");
  }

  function setCurrentLayers(nextLayers: DesignLayer[], recordHistory = true) {
    if (recordHistory) rememberSnapshot();

    if (side === "front") {
      setFrontLayers(nextLayers);
    } else {
      setBackLayers(nextLayers);
    }
  }

  function updateLayer(id: string, updates: Partial<DesignLayer>) {
    const next = layers.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer));
    setCurrentLayers(next, false);
  }

  function handleLayerPointerDown(event: PointerEvent<HTMLButtonElement>, layer: DesignLayer) {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    dragRef.current = {
      layerId: layer.id,
      offsetX: event.clientX - rect.left - layer.x,
      offsetY: event.clientY - rect.top - layer.y,
    };
    setSelectedId(layer.id);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleLayerPointerMove(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    const card = cardRef.current;
    if (!drag || !card) return;

    const rect = card.getBoundingClientRect();
    const nextX = Math.max(0, Math.min(rect.width - 20, event.clientX - rect.left - drag.offsetX));
    const nextY = Math.max(0, Math.min(rect.height - 20, event.clientY - rect.top - drag.offsetY));
    updateLayer(drag.layerId, { x: nextX, y: nextY });
  }

  function handleLayerPointerUp(event: PointerEvent<HTMLButtonElement>) {
    dragRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be released by the browser.
    }
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

  async function addFreeQrCode() {
    const value = qrValue.trim();

    if (!value) {
      setNotice("Enter a URL or text value before adding a free QR code.");
      return;
    }

    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=900x900&format=png&data=${encodeURIComponent(value)}`;
      const preview = await urlToDataUrl(qrUrl);
      const qrLayer: DesignLayer = {
        id: crypto.randomUUID(),
        type: "image",
        preview,
        originalPreview: preview,
        x: 520,
        y: 170,
        width: 120,
        height: 120,
        rotation: 0,
      };

      setCurrentLayers([...layers, qrLayer]);
      setSelectedId(qrLayer.id);
      setQrValue("");
      setNotice("Free static QR code added. It does not track scans or use dynamic redirects.");
    } catch {
      setNotice("Could not generate the free QR code. Please try again.");
    }
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
        originalPreview: String(reader.result ?? ""),
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

  async function flattenCardSide(cardSide: CardSide) {
    const sideLayers = cardSide === "front" ? frontLayers : backLayers;
    const canvas = document.createElement("canvas");
    canvas.width = 700;
    canvas.height = 400;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const layer of sideLayers) {
      if (layer.type === "image" && layer.preview) {
        const image = await readImage(layer.preview);
        const width = layer.width ?? 180;
        const height = layer.height ?? 110;

        ctx.save();
        ctx.translate(layer.x + width / 2, layer.y + height / 2);
        ctx.rotate(((layer.rotation ?? 0) * Math.PI) / 180);
        ctx.drawImage(image, -width / 2, -height / 2, width, height);
        ctx.restore();
      }

      if (layer.type === "text" && layer.text) {
        ctx.save();
        ctx.translate(layer.x, layer.y);
        ctx.rotate(((layer.rotation ?? 0) * Math.PI) / 180);
        ctx.font = `${layer.fontSize ?? 22}px ${layer.fontFamily ?? "Arial"}`;
        ctx.fillStyle = layer.fill ?? "#111111";
        ctx.textBaseline = "top";
        ctx.fillText(layer.text, 0, 0);
        ctx.restore();
      }
    }

    return canvas.toDataURL("image/png");
  }

  async function addToCart() {
    setNotice("Preparing clipped print files for cart...");
    const [frontFlattened, backFlattened] = await Promise.all([
      sideHasContent(frontLayers) ? flattenCardSide("front") : Promise.resolve(null),
      sideHasContent(backLayers) ? flattenCardSide("back") : Promise.resolve(null),
    ]);

    const item: CartItem = {
      id: crypto.randomUUID(),
      productId: product.id,
      productName: `Custom ${product.name}`,
      size,
      color: finish,
      quantity,
      frontLayers,
      backLayers,
      mockupPreview: frontFlattened ?? backFlattened,
      frontPreview: frontFlattened,
      backPreview: backFlattened,
      unitPrice: price.unitPrice,
      lineTotal: price.lineTotal,
      createdAt: new Date().toISOString(),
    };
    const currentCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]") as CartItem[];
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([...currentCart, item]));
    trackStorefrontEvent("added_to_cart", {
      product_id: product.id,
      product_name: product.name,
      quantity,
      line_total: price.lineTotal,
      front_layers: frontLayers.length,
      back_layers: backLayers.length,
    });
    window.location.href = "/cart";
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
              <div ref={cardRef} className="relative aspect-[1.75/1] w-full max-w-[760px] overflow-hidden rounded-[26px] border border-white/70 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
                <div className="absolute inset-5 rounded-[20px] border-2 border-dashed border-blue-500/70" />
                {layers.map((layer) => (
                  <button
                    key={layer.id}
                    type="button"
                    onPointerDown={(event) => handleLayerPointerDown(event, layer)}
                    onPointerMove={handleLayerPointerMove}
                    onPointerUp={handleLayerPointerUp}
                    onPointerCancel={handleLayerPointerUp}
                    className={`absolute cursor-move touch-none select-none text-left ${selectedId === layer.id ? "outline outline-2 outline-[#7c3aed]" : ""}`}
                    style={{
                      left: layer.x,
                      top: layer.y,
                      color: layer.fill,
                      fontFamily: layer.fontFamily,
                      fontSize: layer.fontSize,
                      width: layer.width,
                      height: layer.height,
                      transform: `rotate(${layer.rotation ?? 0}deg)`,
                    }}
                  >
                    {layer.type === "image" && layer.preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={layer.preview} alt="Uploaded card art" className="h-full w-full object-contain" />
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

            <div className="rounded-[22px] border border-[#e7eaf3] bg-[#f8faff] p-4">
              <label className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">Free Static QR Code</label>
              <div className="mt-3 grid gap-2">
                <input
                  value={qrValue}
                  onChange={(event) => setQrValue(event.target.value)}
                  className="h-[52px] w-full rounded-[18px] border border-slate-950/10 bg-white px-4 text-sm"
                  placeholder="https://example.com or plain text"
                />
                <button type="button" onClick={addFreeQrCode} className="portal-action">
                  Add Free QR Code
                </button>
              </div>
            </div>

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

            {selectedLayer && (
              <div className="grid gap-3 rounded-[22px] border border-[#e7eaf3] bg-[#f8faff] p-4">
                <p className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">Selected Layer Position</p>
                <div className="grid grid-cols-2 gap-2">
                  <input className="portal-field min-w-0" type="number" value={Math.round(selectedLayer.x)} onChange={(event) => updateLayer(selectedLayer.id, { x: Number(event.target.value) })} placeholder="X" />
                  <input className="portal-field min-w-0" type="number" value={Math.round(selectedLayer.y)} onChange={(event) => updateLayer(selectedLayer.id, { y: Number(event.target.value) })} placeholder="Y" />
                  {selectedImageLayer && (
                    <>
                      <input className="portal-field min-w-0" type="number" value={Math.round(selectedImageLayer.width ?? 180)} onChange={(event) => updateLayer(selectedImageLayer.id, { width: Number(event.target.value) })} placeholder="Width" />
                      <input className="portal-field min-w-0" type="number" value={Math.round(selectedImageLayer.height ?? 110)} onChange={(event) => updateLayer(selectedImageLayer.id, { height: Number(event.target.value) })} placeholder="Height" />
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={undo} disabled={!undoStack.length} className="portal-action disabled:cursor-not-allowed disabled:opacity-50">
                Undo
              </button>
              <button type="button" onClick={redo} disabled={!redoStack.length} className="portal-action disabled:cursor-not-allowed disabled:opacity-50">
                Redo
              </button>
            </div>

            <button type="button" onClick={deleteSelectedLayer} className="min-h-[54px] rounded-[18px] border border-red-500/15 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              Delete Selected Design
            </button>

            <label className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">Quantity</label>
            <input className="h-[58px] w-full rounded-[18px] border border-slate-950/10 bg-white px-[18px] text-base" type="number" min={product.minimumQuantity} value={quantity} onChange={(event) => setQuantity(Math.max(product.minimumQuantity, Number(event.target.value) || product.minimumQuantity))} />

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
            <Link href="/products/business-cards" className="rounded-full border border-[#e5e7eb] bg-white px-5 py-4 text-center text-sm font-extrabold text-[#111827] no-underline">
              Back To Product
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
