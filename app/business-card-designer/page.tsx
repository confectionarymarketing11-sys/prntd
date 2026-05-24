"use client";

import Link from "next/link";
import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Group,
  Layer,
  Stage,
} from "react-konva";

import ShopHeader from "@/components/ShopHeader";
import URLImage from "@/components/customizer/URLImage";
import URLText from "@/components/customizer/URLText";

import {
  trackStorefrontEvent,
} from "@/lib/storefront-analytics";

import {
  CartItem,
  DesignLayer,
  formatMoney,
  getProduct,
  priceDesign,
} from "@/data/shop";

import {
  addCartItem,
} from "@/lib/cart-storage";

const fonts = [
  "Arial",
  "Impact",
  "Helvetica",
  "Verdana",
  "Georgia",
  "Times New Roman",
  "Courier New",
];

const sides = [
  "front",
  "back",
] as const;

type CardSide =
  (typeof sides)[number];

type DesignerSnapshot = {
  frontLayers: DesignLayer[];
  backLayers: DesignLayer[];
};

const CARD_ASPECT_RATIO =
  1.75;

function sideHasContent(
  layers: DesignLayer[],
) {
  return layers.some(
    (layer) =>
      layer.type ===
        "image" ||
      Boolean(
        layer.text?.trim(),
      ),
  );
}

async function urlToDataUrl(
  url: string,
) {
  const response =
    await fetch(url);

  const blob =
    await response.blob();

  return new Promise<string>(
    (
      resolve,
      reject,
    ) => {
      const reader =
        new FileReader();

      reader.onload =
        () =>
          resolve(
            String(
              reader.result ??
                "",
            ),
          );

      reader.onerror =
        reject;

      reader.readAsDataURL(
        blob,
      );
    },
  );
}

function readImage(
  src: string,
) {
  return new Promise<HTMLImageElement>(
    (
      resolve,
      reject,
    ) => {
      const image =
        new Image();

      image.crossOrigin =
        "anonymous";

      image.onload = () =>
        resolve(image);

      image.onerror =
        reject;

      image.src = src;
    },
  );
}

export default function BusinessCardDesignerPage() {
  const product =
    getProduct(
      "business-cards",
    );

  const [side, setSide] =
    useState<CardSide>(
      "front",
    );

  const [
    frontLayers,
    setFrontLayers,
  ] = useState<
    DesignLayer[]
  >([]);

  const [
    backLayers,
    setBackLayers,
  ] = useState<
    DesignLayer[]
  >([]);

  const [
    selectedId,
    setSelectedId,
  ] = useState<
    string | null
  >(null);

  const [
    fontFamily,
    setFontFamily,
  ] =
    useState("Arial");

  const [
    textColor,
    setTextColor,
  ] =
    useState("#ffffff");

  const [qrValue, setQrValue] =
    useState("");

  const [
    quantity,
    setQuantity,
  ] = useState(
    product.minimumQuantity,
  );

  const [size] = useState(
    product.sizes[0] ??
      "Standard",
  );

  const [finish] =
    useState(
      product.colors[0],
    );

  const [notice, setNotice] =
    useState(
      "Keep all artwork inside the card edge.",
    );

  const [
    undoStack,
    setUndoStack,
  ] = useState<
    DesignerSnapshot[]
  >([]);

  const [
    redoStack,
    setRedoStack,
  ] = useState<
    DesignerSnapshot[]
  >([]);

  const [
    adminBasePrice,
    setAdminBasePrice,
  ] = useState(
    product.basePrice,
  );

  const stageWrapRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [
    stageWidth,
    setStageWidth,
  ] = useState(700);

  const stageHeight =
    Math.round(
      stageWidth /
        CARD_ASPECT_RATIO,
    );

  const layers =
    side === "front"
      ? frontLayers
      : backLayers;

  const selectedLayer =
    layers.find(
      (layer) =>
        layer.id ===
        selectedId,
    );

  const selectedTextLayer =
    selectedLayer?.type ===
    "text"
      ? selectedLayer
      : null;

  const selectedImageLayer =
    selectedLayer?.type ===
    "image"
      ? selectedLayer
      : null;

  const pricedProduct =
    useMemo(
      () => ({
        ...product,
        basePrice:
          adminBasePrice,
      }),
      [
        adminBasePrice,
        product,
      ],
    );

  const price = useMemo(
    () =>
      priceDesign(
        pricedProduct,
        quantity,
        frontLayers,
        backLayers,
      ),
    [
      pricedProduct,
      quantity,
      frontLayers,
      backLayers,
    ],
  );

  useEffect(() => {
    let active = true;

    fetch(
      "/api/products/pricing",
    )
      .then((response) =>
        response.json(),
      )
      .then(
        (
          pricing: Record<
            string,
            {
              price?: number;
            }
          >,
        ) => {
          const nextPrice =
            pricing[
              product.id
            ]?.price;

          if (
            active &&
            typeof nextPrice ===
              "number" &&
            nextPrice > 0
          ) {
            setAdminBasePrice(
              nextPrice,
            );
          }
        },
      )
      .catch(
        () => undefined,
      );

    return () => {
      active = false;
    };
  }, [product.id]);

  useEffect(() => {
    const element =
      stageWrapRef.current;

    if (!element)
      return;

    const observer =
      new ResizeObserver(
        ([entry]) => {
          setStageWidth(
            Math.min(
              760,
              Math.max(
                300,
                entry
                  .contentRect
                  .width,
              ),
            ),
          );
        },
      );

    observer.observe(
      element,
    );

    return () =>
      observer.disconnect();
  }, []);

  function currentSnapshot(): DesignerSnapshot {
    return {
      frontLayers,
      backLayers,
    };
  }

  function rememberSnapshot() {
    const snapshot =
      currentSnapshot();

    setUndoStack(
      (current) => [
        ...current.slice(
          -24,
        ),
        snapshot,
      ],
    );

    setRedoStack([]);
  }

  function applySnapshot(
    snapshot: DesignerSnapshot,
  ) {
    setFrontLayers(
      snapshot.frontLayers,
    );

    setBackLayers(
      snapshot.backLayers,
    );

    setSelectedId(null);
  }

  function undo() {
    const previous =
      undoStack.at(-1);

    if (!previous)
      return;

    setUndoStack(
      (current) =>
        current.slice(
          0,
          -1,
        ),
    );

    setRedoStack(
      (current) => [
        ...current.slice(
          -24,
        ),
        currentSnapshot(),
      ],
    );

    applySnapshot(
      previous,
    );

    setNotice(
      "Last customizer action undone.",
    );
  }

  function redo() {
    const next =
      redoStack.at(-1);

    if (!next)
      return;

    setRedoStack(
      (current) =>
        current.slice(
          0,
          -1,
        ),
    );

    setUndoStack(
      (current) => [
        ...current.slice(
          -24,
        ),
        currentSnapshot(),
      ],
    );

    applySnapshot(next);

    setNotice(
      "Customizer action redone.",
    );
  }

  function setCurrentLayers(
    nextLayers: DesignLayer[],
    recordHistory = true,
  ) {
    if (recordHistory)
      rememberSnapshot();

    if (
      side === "front"
    ) {
      setFrontLayers(
        nextLayers,
      );
    } else {
      setBackLayers(
        nextLayers,
      );
    }
  }

  function updateLayer(
    id: string,
    updates: Partial<DesignLayer>,
  ) {
    const next =
      layers.map(
        (layer) =>
          layer.id === id
            ? {
                ...layer,
                ...updates,
              }
            : layer,
      );

    setCurrentLayers(
      next,
      false,
    );
  }

  function updateLayerWithHistory(
    id: string,
    updates: Partial<DesignLayer>,
  ) {
    rememberSnapshot();

    updateLayer(
      id,
      updates,
    );
  }

  function editTextLayer(
    layer: DesignLayer,
  ) {
    const nextText =
      window.prompt(
        "Edit text",
        layer.text ?? "",
      );

    if (
      nextText === null
    )
      return;

    updateLayerWithHistory(
      layer.id,
      {
        text: nextText,
      },
    );
  }

  function addText() {
    const nextLayer: DesignLayer =
      {
        id: crypto.randomUUID(),
        type: "text",
        text: "Your Name",
        x: 24,
        y: 32,
        fontSize: 22,
        fontFamily,
        fill: textColor,
        width: 180,
        height: 36,
        rotation: 0,
      };

    setCurrentLayers([
      ...layers,
      nextLayer,
    ]);

    setSelectedId(
      nextLayer.id,
    );

    setNotice(
      "Text added.",
    );
  }

  async function addFreeQrCode() {
    const value =
      qrValue.trim();

    if (!value) {
      setNotice(
        "Enter a value before generating a QR code.",
      );
      return;
    }

    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=900x900&format=png&data=${encodeURIComponent(
        value,
      )}`;

      const preview =
        await urlToDataUrl(
          qrUrl,
        );

      const qrLayer: DesignLayer =
        {
          id: crypto.randomUUID(),
          type: "image",
          preview,
          originalPreview:
            preview,
          x: 520,
          y: 170,
          width: 120,
          height: 120,
          rotation: 0,
        };

      setCurrentLayers([
        ...layers,
        qrLayer,
      ]);

      setSelectedId(
        qrLayer.id,
      );

      setQrValue("");

      setNotice(
        "QR code added.",
      );
    } catch {
      setNotice(
        "QR code generation failed.",
      );
    }
  }

  function deleteSelectedLayer() {
    if (!selectedId)
      return;

    setCurrentLayers(
      layers.filter(
        (layer) =>
          layer.id !==
          selectedId,
      ),
    );

    setSelectedId(null);

    setNotice(
      "Selected layer removed.",
    );
  }

  function handleUpload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target
        .files?.[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = () => {
      const nextLayer: DesignLayer =
        {
          id: crypto.randomUUID(),
          type: "image",
          preview: String(
            reader.result ??
              "",
          ),
          originalPreview:
            String(
              reader.result ??
                "",
            ),
          x: 24,
          y: 24,
          width: 180,
          height: 110,
          rotation: 0,
        };

      setCurrentLayers([
        ...layers,
        nextLayer,
      ]);

      setSelectedId(
        nextLayer.id,
      );

      setNotice(
        "Image uploaded.",
      );
    };

    reader.readAsDataURL(
      file,
    );

    event.target.value =
      "";
  }

  async function flattenCardSide(
    cardSide: CardSide,
  ) {
    const sideLayers =
      cardSide ===
      "front"
        ? frontLayers
        : backLayers;

    const canvas =
      document.createElement(
        "canvas",
      );

    canvas.width =
      stageWidth;

    canvas.height =
      stageHeight;

    const ctx =
      canvas.getContext(
        "2d",
      );

    if (!ctx) return null;

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height,
    );

    for (const layer of sideLayers) {
      if (
        layer.type ===
          "image" &&
        layer.preview
      ) {
        const image =
          await readImage(
            layer.preview,
          );

        const width =
          layer.width ??
          180;

        const height =
          layer.height ??
          110;

        ctx.save();

        ctx.translate(
          layer.x +
            width / 2,
          layer.y +
            height / 2,
        );

        ctx.rotate(
          ((layer.rotation ??
            0) *
            Math.PI) /
            180,
        );

        ctx.drawImage(
          image,
          -width / 2,
          -height / 2,
          width,
          height,
        );

        ctx.restore();
      }

      if (
        layer.type ===
          "text" &&
        layer.text
      ) {
        ctx.save();

        ctx.translate(
          layer.x,
          layer.y,
        );

        ctx.rotate(
          ((layer.rotation ??
            0) *
            Math.PI) /
            180,
        );

        ctx.font = `${
          layer.fontSize ??
          22
        }px ${
          layer.fontFamily ??
          "Arial"
        }`;

        ctx.fillStyle =
          layer.fill ??
          "#ffffff";

        ctx.textBaseline =
          "top";

        ctx.fillText(
          layer.text,
          0,
          0,
        );

        ctx.restore();
      }
    }

    return canvas.toDataURL(
      "image/png",
    );
  }

  async function addToCart() {
    setNotice(
      "Preparing artwork...",
    );

    const [
      frontFlattened,
      backFlattened,
    ] = await Promise.all([
      sideHasContent(
        frontLayers,
      )
        ? flattenCardSide(
            "front",
          )
        : Promise.resolve(
            null,
          ),

      sideHasContent(
        backLayers,
      )
        ? flattenCardSide(
            "back",
          )
        : Promise.resolve(
            null,
          ),
    ]);

    try {
      const item: CartItem =
        {
          id: crypto.randomUUID(),
          productId:
            product.id,
          productName: `Custom ${product.name}`,
          size,
          color: finish,
          quantity,
          frontLayers,
          backLayers,
          mockupPreview:
            frontFlattened ??
            backFlattened,
          frontPreview:
            frontFlattened,
          backPreview:
            backFlattened,
          unitPrice:
            price.unitPrice,
          lineTotal:
            price.lineTotal,
          createdAt:
            new Date().toISOString(),
        };

      await addCartItem(
        item,
      );

      trackStorefrontEvent(
        "added_to_cart",
        {
          product_id:
            product.id,
          product_name:
            product.name,
          quantity,
          line_total:
            price.lineTotal,
        },
      );

      window.location.href =
        "/cart";
    } catch {
      setNotice(
        "Could not add design to cart.",
      );
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#020617] text-white">
      {/* BG */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[#4f46e5]/15 blur-[140px]" />

        <div className="absolute bottom-[-10%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[#2563eb]/15 blur-[140px]" />
      </div>

      <div className="relative z-10">
        <ShopHeader />

        <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-[22px] sm:py-10">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_420px] max-[860px]:grid-cols-1 sm:gap-8">
            {/* DESIGN AREA */}
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0f172a]/80 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:rounded-[34px] sm:p-7">
              <div className="absolute right-[-10%] top-[-10%] h-[260px] w-[260px] rounded-full bg-[#6366f1]/15 blur-[90px]" />

              <div className="relative z-10">
                {/* HEADER */}
                <div className="mb-7">
                  <p className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#c7d2fe]">
                    Business Card Designer
                  </p>

                  <h1 className="mt-5 text-[clamp(34px,11vw,72px)] font-black leading-[0.96] tracking-[-0.04em] sm:leading-[0.92] sm:tracking-[-0.06em]">
                    Create
                    <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                      Premium Cards
                    </span>
                  </h1>

                  <p className="mt-5 max-w-2xl text-base leading-8 text-[#cbd5e1]">
                    Upload artwork,
                    add text,
                    generate QR
                    codes, and
                    create premium
                    business card
                    layouts directly
                    in your browser.
                  </p>
                </div>

                {/* SIDE SWITCH */}
                <div className="mb-6 flex gap-3">
                  {sides.map(
                    (
                      cardSide,
                    ) => (
                      <button
                        key={
                          cardSide
                        }
                        type="button"
                        onClick={() => {
                          setSide(
                            cardSide,
                          );

                          setSelectedId(
                            null,
                          );
                        }}
                        className={`rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.08em] transition ${
                          side ===
                          cardSide
                            ? "bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] text-white shadow-[0_10px_30px_rgba(99,102,241,0.35)]"
                            : "border border-white/10 bg-white/[0.04] text-[#cbd5e1]"
                          } flex-1 sm:flex-none`}
                      >
                        {
                          cardSide
                        }
                      </button>
                    ),
                  )}
                </div>

                {/* STAGE */}
                <div className="grid min-h-[280px] place-items-center rounded-[24px] border border-white/10 bg-[#020617] p-3 sm:min-h-[420px] sm:rounded-[30px] sm:p-5 lg:min-h-[520px]">
                  <div
                    ref={
                      stageWrapRef
                    }
                    className="relative aspect-[1.75/1] w-full max-w-[760px] overflow-hidden rounded-[20px] border border-white/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:rounded-[28px]"
                  >
                    <Stage
                      width={
                        stageWidth
                      }
                      height={
                        stageHeight
                      }
                      className="!absolute inset-0 z-10"
                      onMouseDown={(
                        event,
                      ) => {
                        if (
                          event.target ===
                          event.target.getStage()
                        ) {
                          setSelectedId(
                            null,
                          );
                        }
                      }}
                      onTouchStart={(
                        event,
                      ) => {
                        if (
                          event.target ===
                          event.target.getStage()
                        ) {
                          setSelectedId(
                            null,
                          );
                        }
                      }}
                    >
                      <Layer>
                        <Group>
                          {layers.map(
                            (
                              layer,
                            ) =>
                              layer.type ===
                              "image" ? (
                                <URLImage
                                  key={
                                    layer.id
                                  }
                                  layer={
                                    layer
                                  }
                                  isSelected={
                                    selectedId ===
                                    layer.id
                                  }
                                  onSelect={() =>
                                    setSelectedId(
                                      layer.id,
                                    )
                                  }
                                  updateLayer={
                                    updateLayerWithHistory
                                  }
                                />
                              ) : (
                                <URLText
                                  key={
                                    layer.id
                                  }
                                  layer={
                                    layer
                                  }
                                  isSelected={
                                    selectedId ===
                                    layer.id
                                  }
                                  onSelect={() =>
                                    setSelectedId(
                                      layer.id,
                                    )
                                  }
                                  updateLayer={
                                    updateLayerWithHistory
                                  }
                                  onEdit={
                                    editTextLayer
                                  }
                                />
                              ),
                          )}
                        </Group>
                      </Layer>
                    </Stage>

                    <div className="pointer-events-none absolute inset-5 z-20 rounded-[20px] border-2 border-dashed border-[#60a5fa]/70" />
                  </div>
                </div>

                {/* NOTICE */}
                <p className="mt-5 rounded-[20px] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-semibold text-[#cbd5e1]">
                  {notice}
                </p>
              </div>
            </div>

            {/* SIDEBAR */}
            <aside className="flex flex-col gap-5 rounded-[28px] border border-white/10 bg-[#0f172a]/80 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:rounded-[34px] sm:p-7">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                  Customizer
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">
                  Controls
                </h2>
              </div>

              {/* UPLOAD */}
              <div>
                <label className="text-xs font-black uppercase tracking-[0.12em] text-[#94a3b8]">
                  Upload Artwork
                </label>

                <input
                  className="mt-3 w-full rounded-[22px] border border-dashed border-[#6366f1]/25 bg-[#020617] p-5 text-sm text-[#cbd5e1]"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={
                    handleUpload
                  }
                />
              </div>

              {/* TEXT */}
              <button
                type="button"
                onClick={
                  addText
                }
                className="rounded-[20px] bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_40px_rgba(99,102,241,0.35)]"
              >
                Add Text
              </button>

              {/* QR */}
              <div className="rounded-[24px] border border-white/10 bg-[#020617] p-5">
                <label className="text-xs font-black uppercase tracking-[0.12em] text-[#94a3b8]">
                  Free QR Code
                </label>

                <div className="mt-4 grid gap-3">
                  <input
                    value={
                      qrValue
                    }
                    onChange={(
                      event,
                    ) =>
                      setQrValue(
                        event
                          .target
                          .value,
                      )
                    }
                    className="h-[54px] rounded-[18px] border border-white/10 bg-[#0f172a] px-4 text-sm text-white"
                    placeholder="https://example.com"
                  />

                  <button
                    type="button"
                    onClick={
                      addFreeQrCode
                    }
                    className="rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-[#cbd5e1]"
                  >
                    Add QR Code
                  </button>
                </div>
              </div>

              {/* FONT */}
              <div>
                <label className="text-xs font-black uppercase tracking-[0.12em] text-[#94a3b8]">
                  Font
                </label>

                <select
                  value={
                    fontFamily
                  }
                  onChange={(
                    event,
                  ) =>
                    setFontFamily(
                      event
                        .target
                        .value,
                    )
                  }
                  className="mt-3 h-[56px] w-full rounded-[18px] border border-white/10 bg-[#020617] px-4 text-sm text-white"
                >
                  {fonts.map(
                    (
                      font,
                    ) => (
                      <option
                        key={
                          font
                        }
                      >
                        {font}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* COLOR */}
              <div>
                <label className="text-xs font-black uppercase tracking-[0.12em] text-[#94a3b8]">
                  Text Color
                </label>

                <input
                  type="color"
                  value={
                    textColor
                  }
                  onChange={(
                    event,
                  ) =>
                    setTextColor(
                      event
                        .target
                        .value,
                    )
                  }
                  className="mt-3 h-[54px] w-full rounded-[18px] border border-white/10 bg-[#020617] p-2"
                />
              </div>

              {/* EDIT */}
              {selectedTextLayer && (
                <input
                  value={
                    selectedTextLayer.text ??
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    updateLayer(
                      selectedTextLayer.id,
                      {
                        text: event
                          .target
                          .value,
                        fontFamily,
                        fill: textColor,
                      },
                    )
                  }
                  className="h-[56px] w-full rounded-[18px] border border-white/10 bg-[#020617] px-4 text-white"
                />
              )}

              {/* POSITION */}
              {selectedLayer && (
                <div className="grid gap-3 rounded-[24px] border border-white/10 bg-[#020617] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#94a3b8]">
                    Selected
                    Layer
                  </p>

                  <div className="grid grid-cols-2 gap-3 max-[420px]:grid-cols-1">
                    <input
                      className="h-[52px] rounded-[18px] border border-white/10 bg-[#0f172a] px-4 text-sm text-white"
                      type="number"
                      value={Math.round(
                        selectedLayer.x,
                      )}
                      onChange={(
                        event,
                      ) =>
                        updateLayer(
                          selectedLayer.id,
                          {
                            x: Number(
                              event
                                .target
                                .value,
                            ),
                          },
                        )
                      }
                    />

                    <input
                      className="h-[52px] rounded-[18px] border border-white/10 bg-[#0f172a] px-4 text-sm text-white"
                      type="number"
                      value={Math.round(
                        selectedLayer.y,
                      )}
                      onChange={(
                        event,
                      ) =>
                        updateLayer(
                          selectedLayer.id,
                          {
                            y: Number(
                              event
                                .target
                                .value,
                            ),
                          },
                        )
                      }
                    />

                    {selectedImageLayer && (
                      <>
                        <input
                          className="h-[52px] rounded-[18px] border border-white/10 bg-[#0f172a] px-4 text-sm text-white"
                          type="number"
                          value={Math.round(
                            selectedImageLayer.width ??
                              180,
                          )}
                          onChange={(
                            event,
                          ) =>
                            updateLayer(
                              selectedImageLayer.id,
                              {
                                width:
                                  Number(
                                    event
                                      .target
                                      .value,
                                  ),
                              },
                            )
                          }
                        />

                        <input
                          className="h-[52px] rounded-[18px] border border-white/10 bg-[#0f172a] px-4 text-sm text-white"
                          type="number"
                          value={Math.round(
                            selectedImageLayer.height ??
                              110,
                          )}
                          onChange={(
                            event,
                          ) =>
                            updateLayer(
                              selectedImageLayer.id,
                              {
                                height:
                                  Number(
                                    event
                                      .target
                                      .value,
                                  ),
                              },
                            )
                          }
                        />
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ACTIONS */}
              <div className="grid grid-cols-2 gap-3 max-[420px]:grid-cols-1">
                <button
                  type="button"
                  onClick={
                    undo
                  }
                  disabled={
                    !undoStack.length
                  }
                  className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-black uppercase tracking-[0.08em] text-[#cbd5e1] disabled:opacity-40"
                >
                  Undo
                </button>

                <button
                  type="button"
                  onClick={
                    redo
                  }
                  disabled={
                    !redoStack.length
                  }
                  className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-black uppercase tracking-[0.08em] text-[#cbd5e1] disabled:opacity-40"
                >
                  Redo
                </button>
              </div>

              {/* DELETE */}
              <button
                type="button"
                onClick={
                  deleteSelectedLayer
                }
                className="rounded-[18px] border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm font-black uppercase tracking-[0.08em] text-red-300"
              >
                Delete Selected
              </button>

              {/* QTY */}
              <div>
                <label className="text-xs font-black uppercase tracking-[0.12em] text-[#94a3b8]">
                  Quantity
                </label>

                <input
                  className="mt-3 h-[56px] w-full rounded-[18px] border border-white/10 bg-[#020617] px-4 text-white"
                  type="number"
                  min={
                    product.minimumQuantity
                  }
                  value={
                    quantity
                  }
                  onChange={(
                    event,
                  ) =>
                    setQuantity(
                      Math.max(
                        product.minimumQuantity,
                        Number(
                          event
                            .target
                            .value,
                        ) ||
                          product.minimumQuantity,
                      ),
                    )
                  }
                />
              </div>

              {/* PRICE */}
              <div className="rounded-[30px] border border-white/10 bg-[#020617] p-6">
                <p className="text-sm font-black uppercase tracking-[0.12em] text-[#94a3b8]">
                  Estimated
                  Total
                </p>

                <p className="mt-3 text-[clamp(32px,12vw,42px)] font-black leading-none text-white">
                  {formatMoney(
                    price.lineTotal,
                  )}
                </p>

                <p className="mt-4 rounded-[16px] bg-[#0f172a] px-4 py-3 text-sm text-[#cbd5e1]">
                  {sideHasContent(
                    frontLayers,
                  ) &&
                  sideHasContent(
                    backLayers,
                  )
                    ? "Double-sided card design"
                    : "Single-sided card design"}
                </p>
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={
                  addToCart
                }
                className="rounded-[20px] bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] px-5 py-5 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_40px_rgba(99,102,241,0.35)]"
              >
                Add To Cart
              </button>

              <Link
                href="/products/business-cards"
                className="rounded-[20px] border border-white/10 bg-white/[0.04] px-5 py-4 text-center text-sm font-black uppercase tracking-[0.08em] text-[#cbd5e1] no-underline"
              >
                Back To Product
              </Link>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
