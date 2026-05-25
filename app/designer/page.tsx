"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Group, Layer, Stage } from "react-konva";
import ShopHeader from "@/components/ShopHeader";
import URLImage from "@/components/customizer/URLImage";
import URLText from "@/components/customizer/URLText";
import { trackStorefrontEvent } from "@/lib/storefront-analytics";
import {
  CartItem,
  DesignLayer,
  ProductPricing,
  findPricingVariant,
  formatMoney,
  getProduct,
  roundMoney,
} from "@/data/shop";
import { addCartItem } from "@/lib/cart-storage";
import { updateLayerList } from "@/store/customizerStore";

type ShirtSide = "front" | "back";

type ShirtColor = {
  key: string;
  name: string;
  swatch: string;
  images: Record<ShirtSide, string>;
};

type DesignerSnapshot = {
  frontLayers: DesignLayer[];
  backLayers: DesignLayer[];
};

const shirtColors: ShirtColor[] = [
  {
    key: "white",
    name: "White",
    swatch: "#ffffff",
    images: {
      front: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_White_flat_front.webp?v=1778969128",
      back: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_White_flat_back_V2.webp?v=1778969128",
    },
  },
  {
    key: "black",
    name: "Black",
    swatch: "#111111",
    images: {
      front: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Black_flat_front.webp?v=1778968991",
      back: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Black_flat_back.webp?v=1778968991",
    },
  },
  {
    key: "sportgrey",
    name: "Sport Grey",
    swatch: "#9ca3af",
    images: {
      front: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Sport_Grey_flat_front.webp?v=1778969128",
      back: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Sport_Grey_flat_back.webp?v=1778969128",
    },
  },
  {
    key: "navy",
    name: "Navy",
    swatch: "#1e3a8a",
    images: {
      front: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Navy_flat_front.webp?v=1778970017",
      back: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Navy_flat_back.webp?v=1778970017",
    },
  },
  {
    key: "red",
    name: "Red",
    swatch: "#dc2626",
    images: {
      front: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Red_flat_front.webp?v=1778970097",
      back: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Red_flat_back.webp?v=1778970097",
    },
  },
  {
    key: "forestgreen",
    name: "Forest Green",
    swatch: "#14532d",
    images: {
      front: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Forest_Green_flat_front.webp?v=1778970200",
      back: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Forest_Green_flat_back.webp?v=1778970200",
    },
  },
  {
    key: "militarygreen",
    name: "Military Green",
    swatch: "#4b5320",
    images: {
      front: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Military_Green_flat_front.webp?v=1778970281",
      back: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Military_Green_flat_back.webp?v=1778970281",
    },
  },
  {
    key: "sand",
    name: "Sand",
    swatch: "#d6c7a1",
    images: {
      front: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Sand_flat_front.webp?v=1778969128",
      back: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Sand_flat_back.webp?v=1778969127",
    },
  },
  {
    key: "carolinablue",
    name: "Carolina Blue",
    swatch: "#7dd3fc",
    images: {
      front: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Carolina_Blue_flat_front.webp?v=1778968991",
      back: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Carolina_Blue_flat_back.webp?v=1778968991",
    },
  },
  {
    key: "sapphire",
    name: "Sapphire",
    swatch: "#0284c7",
    images: {
      front: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Sapphire_flat_front.webp?v=1778969128",
      back: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Sapphire_flat_back.webp?v=1778969128",
    },
  },
  {
    key: "purple",
    name: "Purple",
    swatch: "#7e22ce",
    images: {
      front: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Purple_flat_front.webp?v=1778970507",
      back: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Purple_flat_back.webp?v=1778970506",
    },
  },
  {
    key: "HeatherRadiantOrchid",
    name: "Heather Radiant Orchid",
    swatch: "#a15a95",
    images: {
      front: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Heather_Radiant_Orchid_flat_front.webp?v=1779113578",
      back: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Heather_Radiant_Orchid_flat_back.webp?v=1779113578",
    },
  },
  {
    key: "heliconia",
    name: "Heliconia",
    swatch: "#ec4899",
    images: {
      front: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Heliconia_flat_front.webp?v=1778970569",
      back: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Heliconia_flat_back.webp?v=1778970569",
    },
  },
  {
    key: "orange",
    name: "Orange",
    swatch: "#ea580c",
    images: {
      front: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Orange_flat_front.webp?v=1778970629",
      back: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Orange_flat_back.webp?v=1778970629",
    },
  },
  {
    key: "safetyorange",
    name: "Safety Orange",
    swatch: "#f97316",
    images: {
      front: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Safety_Orange_flat_front.webp?v=1778969127",
      back: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Safety_Orange_flat_back.webp?v=1778969127",
    },
  },
  {
    key: "maroon",
    name: "Maroon",
    swatch: "#7f1d1d",
    images: {
      front: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Maroon_flat_front.webp?v=1778970744",
      back: "https://cdn.shopify.com/s/files/1/0785/9313/0728/files/5000_Maroon_flat_back.webp?v=1778970744",
    },
  },
];

const fontFamilies = [
  "Arial",
  "Impact",
  "Helvetica",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Georgia",
  "Times New Roman",
  "Garamond",
  "Courier New",
  "Brush Script MT",
  "Comic Sans MS",
  "Lucida Handwriting",
  "Palatino Linotype",
  "Copperplate",
];

const shirtSizes = ["Small", "Medium", "Large"];
const oneSidePrice = 35;

function getPrintArea(width: number, height: number) {
  const areaWidth = width * 0.3;
  const areaHeight = height * 0.39;

  return {
    x: width * 0.505 - areaWidth / 2,
    y: height * 0.51 - areaHeight / 2,
    width: areaWidth,
    height: areaHeight,
  };
}

function layerHasArt(layers: DesignLayer[]) {
  return layers.some((layer) => layer.type === "image" || Boolean(layer.text?.trim()));
}

function readImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
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

function trimTransparentPixels(img: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return img.src;

  ctx.drawImage(img, 0, 0);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let top: number | null = null;
  let left: number | null = null;
  let right: number | null = null;
  let bottom: number | null = null;

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const alpha = data[(y * canvas.width + x) * 4 + 3];

      if (alpha > 10) {
        top = top === null ? y : top;
        left = left === null || x < left ? x : left;
        right = right === null || x > right ? x : right;
        bottom = bottom === null || y > bottom ? y : bottom;
      }
    }
  }

  if (top === null || left === null || right === null || bottom === null) {
    return img.src;
  }

  const trimmedWidth = Math.max(1, right - left + 1);
  const trimmedHeight = Math.max(1, bottom - top + 1);
  const trimmedCanvas = document.createElement("canvas");
  trimmedCanvas.width = trimmedWidth;
  trimmedCanvas.height = trimmedHeight;

  const trimmedCtx = trimmedCanvas.getContext("2d");
  if (!trimmedCtx) return img.src;

  trimmedCtx.drawImage(canvas, left, top, trimmedWidth, trimmedHeight, 0, 0, trimmedWidth, trimmedHeight);

  return trimmedCanvas.toDataURL("image/png");
}

export default function DesignerPage() {
  const [productId, setProductId] = useState("classic-tee");
  const [currentView, setCurrentView] = useState<ShirtSide>("front");
  const [currentColorKey, setCurrentColorKey] = useState("white");
  const [frontLayers, setFrontLayers] = useState<DesignLayer[]>([]);
  const [backLayers, setBackLayers] = useState<DesignLayer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("Medium");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#111111");
  const [qrValue, setQrValue] = useState("");
  const [stageWidth, setStageWidth] = useState(720);
  const [notice, setNotice] = useState("Keep everything inside the blue-lined card.");
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [undoStack, setUndoStack] = useState<DesignerSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<DesignerSnapshot[]>([]);
  const [adminBasePrice, setAdminBasePrice] = useState(oneSidePrice);
  const [adminPricing, setAdminPricing] = useState<Record<string, ProductPricing>>({});
  const stageWrapRef = useRef<HTMLDivElement | null>(null);
  const generatedImageLoadedRef = useRef(false);

  const stageHeight = stageWidth * 1.2;
  const printArea = useMemo(() => getPrintArea(stageWidth, stageHeight), [stageWidth, stageHeight]);
  const color = shirtColors.find((item) => item.key === currentColorKey) ?? shirtColors[0];
  const selectedProduct = getProduct(productId);
  const layers = currentView === "front" ? frontLayers : backLayers;
  const selectedLayer = layers.find((layer) => layer.id === selectedId);
  const selectedTextLayer = selectedLayer?.type === "text" ? selectedLayer : null;
  const price = useMemo(() => {
    const isDoubleSided = layerHasArt(frontLayers) && layerHasArt(backLayers);
    const printType = isDoubleSided ? "2 Side" : "1 Side";
    const shirtPricing = adminPricing["classic-tee"];
    const printVariant = findPricingVariant(shirtPricing, "Print Sides", printType);
    const basePrice = printVariant?.price ?? (isDoubleSided ? adminBasePrice + 10 : adminBasePrice);
    const discount = quantity >= 6 ? 20 : quantity >= 2 ? 11 : 0;
    const unitPrice = Math.max(basePrice - discount, 0);

    return {
      printType,
      variantTitle: printVariant?.title ?? printType,
      perShirtDiscount: discount,
      unitPrice,
      lineTotal: roundMoney(unitPrice * quantity),
    };
  }, [adminBasePrice, adminPricing, quantity, frontLayers, backLayers]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      setProductId(params.get("product") ?? "classic-tee");
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/products/pricing")
      .then((response) => response.json())
      .then((pricing: Record<string, ProductPricing>) => {
        if (active) setAdminPricing(pricing);
        const nextPrice = pricing["classic-tee"]?.price;
        if (active && typeof nextPrice === "number" && nextPrice > 0) {
          setAdminBasePrice(nextPrice);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const element = stageWrapRef.current;

    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setStageWidth(Math.min(820, Math.max(300, entry.contentRect.width)));
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (generatedImageLoadedRef.current) return;

    const generatedImage = localStorage.getItem("prntd_generated_image");

    if (!generatedImage) return;

    generatedImageLoadedRef.current = true;

    const startSize = window.innerWidth < 768 ? 160 : 300;

    readImage(generatedImage)
      .then((image) => {
        const aspect = image.width / image.height;
        const width = aspect >= 1 ? startSize : startSize * aspect;
        const height = aspect >= 1 ? startSize / aspect : startSize;
        const generatedLayer: DesignLayer = {
          id: crypto.randomUUID(),
          type: "image",
          preview: generatedImage,
          x: (stageWidth - width) / 2,
          y: (stageHeight - height) / 2,
          width,
          height,
          rotation: 0,
        };

        setCurrentView("front");
        setFrontLayers((current) => [...current, generatedLayer]);
        setSelectedId(generatedLayer.id);
        setNotice("Generated design loaded. Position it inside the blue-lined card.");
        localStorage.removeItem("prntd_generated_image");
      })
      .catch(() => {
        setNotice("Generated design could not be loaded.");
      });
  }, [stageHeight, stageWidth]);

  useEffect(() => {
    function handleDelete(event: KeyboardEvent) {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      if (!selectedId) return;

      event.preventDefault();
      deleteSelectedLayer();
    }

    window.addEventListener("keydown", handleDelete);
    return () => window.removeEventListener("keydown", handleDelete);
  });

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

  function updateLayers(nextLayers: DesignLayer[], recordHistory = true) {
    if (recordHistory) rememberSnapshot();

    if (currentView === "front") {
      setFrontLayers(nextLayers);
    } else {
      setBackLayers(nextLayers);
    }
  }

  function updateLayer(id: string, updates: Partial<DesignLayer>) {
    if (currentView === "front") {
      setFrontLayers((current) => updateLayerList(current, id, updates));
    } else {
      setBackLayers((current) => updateLayerList(current, id, updates));
    }
  }

  function addLayers(nextLayers: DesignLayer[]) {
    const updatedLayers = [...layers, ...nextLayers];
    updateLayers(updatedLayers);
    setSelectedId(nextLayers.at(-1)?.id ?? null);
  }

  function setSide(nextView: ShirtSide) {
    setCurrentView(nextView);
    setSelectedId(null);
    setNotice(`${nextView === "front" ? "Front" : "Back"} side selected.`);
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const imageLayerCount = layers.filter((layer) => layer.type === "image").length;

    if (!files.length) return;

    if (imageLayerCount + files.length > 3) {
      setNotice("Maximum 3 images allowed per side.");
      event.target.value = "";
      return;
    }

    const startSize = window.innerWidth < 768 ? 160 : 300;
    const builtLayers = await Promise.all(
      files.map(
        (file) =>
          new Promise<DesignLayer>((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (readerEvent) => {
              try {
                const image = await readImage(String(readerEvent.target?.result));
                const aspect = image.width / image.height;
                const width = aspect >= 1 ? startSize : startSize * aspect;
                const height = aspect >= 1 ? startSize / aspect : startSize;

                resolve({
                  id: crypto.randomUUID(),
                  type: "image",
                  preview: trimTransparentPixels(image),
                  originalPreview: String(readerEvent.target?.result ?? ""),
                  x: (stageWidth - width) / 2,
                  y: (stageHeight - height) / 2,
                  width,
                  height,
                  rotation: 0,
                });
              } catch (error) {
                reject(error);
              }
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );

    addLayers(builtLayers);
    setNotice(`${builtLayers.length} design${builtLayers.length === 1 ? "" : "s"} added to the ${currentView}.`);
    event.target.value = "";
  }

  function addText() {
    const newLayer: DesignLayer = {
      id: crypto.randomUUID(),
      type: "text",
      text: "Double click to edit",
      x: stageWidth / 2 - 120,
      y: stageHeight / 2 - 20,
      fontSize: 42,
      fontFamily,
      fill: textColor,
      rotation: 0,
    };

    addLayers([newLayer]);
    setNotice("Text added. Edit it in the selected text field or double click the text.");
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
      const qrSize = window.innerWidth < 768 ? 120 : 180;
      const qrLayer: DesignLayer = {
        id: crypto.randomUUID(),
        type: "image",
        preview,
        originalPreview: preview,
        x: stageWidth / 2 - qrSize / 2,
        y: stageHeight / 2 - qrSize / 2,
        width: qrSize,
        height: qrSize,
        rotation: 0,
      };

      addLayers([qrLayer]);
      setQrValue("");
      setNotice("Free static QR code added. It does not track scans or use dynamic redirects.");
    } catch {
      setNotice("Could not generate the free QR code. Please try again.");
    }
  }

  function editTextLayer(layer: DesignLayer) {
    const nextText = window.prompt("Edit text", layer.text ?? "");

    if (nextText === null) return;

    updateLayer(layer.id, { text: nextText });
  }

  function deleteSelectedLayer() {
    if (!selectedId) return;

    updateLayers(layers.filter((layer) => layer.id !== selectedId));
    setSelectedId(null);
    setNotice("Selected design deleted.");
  }

  function moveSelectedLayer(direction: "forward" | "backward") {
    if (!selectedId) return;

    const index = layers.findIndex((layer) => layer.id === selectedId);
    const nextIndex = direction === "forward" ? index + 1 : index - 1;

    if (index < 0 || nextIndex < 0 || nextIndex >= layers.length) return;

    const updatedLayers = [...layers];
    [updatedLayers[index], updatedLayers[nextIndex]] = [updatedLayers[nextIndex], updatedLayers[index]];
    updateLayers(updatedLayers);
  }

  function resetImageSize(layer: DesignLayer, image: HTMLImageElement) {
    const startSize = window.innerWidth < 768 ? 160 : 300;
    const aspect = image.width / image.height;
    const width = aspect >= 1 ? startSize : startSize * aspect;
    const height = aspect >= 1 ? startSize / aspect : startSize;

    updateLayer(layer.id, { width, height, rotation: 0 });
  }

  async function removeBackground() {
    if (!selectedLayer || selectedLayer.type !== "image" || !selectedLayer.preview) {
      setNotice("Select an image first.");
      return;
    }

    setIsRemovingBg(true);
    setNotice("Removing background...");

    try {
      const image = await readImage(selectedLayer.preview);
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable.");

      ctx.drawImage(image, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((nextBlob) => (nextBlob ? resolve(nextBlob) : reject(new Error("Image export failed."))), "image/png");
      });
      const formData = new FormData();
      formData.append("image", blob, "image.png");

      const response = await fetch("https://prntd-bg-remover.onrender.com/api/remove-bg", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("prntd_jwt") ?? ""}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Background removal failed.");
      }

      const resultBlob = await response.blob();
      updateLayer(selectedLayer.id, { preview: URL.createObjectURL(resultBlob) });
      setNotice("Background removed.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsRemovingBg(false);
    }
  }

  async function flattenSide(side: ShirtSide) {
    const sideLayers = side === "front" ? frontLayers : backLayers;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(printArea.width);
    canvas.height = Math.round(printArea.height);

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.translate(-printArea.x, -printArea.y);

    for (const layer of sideLayers) {
      if (layer.type === "image" && layer.preview && layer.width && layer.height) {
        const image = await readImage(layer.preview);

        ctx.save();
        ctx.translate(layer.x + layer.width / 2, layer.y + layer.height / 2);
        ctx.rotate(((layer.rotation ?? 0) * Math.PI) / 180);
        ctx.drawImage(image, -layer.width / 2, -layer.height / 2, layer.width, layer.height);
        ctx.restore();
      }

      if (layer.type === "text" && layer.text) {
        ctx.save();
        ctx.translate(layer.x, layer.y);
        ctx.rotate(((layer.rotation ?? 0) * Math.PI) / 180);
        ctx.font = `${layer.fontSize ?? 42}px ${layer.fontFamily ?? "Arial"}`;
        ctx.fillStyle = layer.fill ?? "#111111";
        ctx.textBaseline = "top";
        ctx.fillText(layer.text, 0, 0);
        ctx.restore();
      }
    }

    return canvas.toDataURL("image/png");
  }

  async function addToCart() {
    setNotice("Preparing design for cart...");

    const [frontFlattened, backFlattened] = await Promise.all([
      layerHasArt(frontLayers) ? flattenSide("front") : Promise.resolve(null),
      layerHasArt(backLayers) ? flattenSide("back") : Promise.resolve(null),
    ]);

    try {
      const item: CartItem = {
        id: crypto.randomUUID(),
        productId: selectedProduct.id,
        productName: `Custom ${selectedProduct.name} (${price.printType})`,
        size,
        color: {
          name: color.name,
          value: color.swatch,
        },
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

      await addCartItem(item);
      trackStorefrontEvent("added_to_cart", {
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity,
        print_type: price.printType,
        line_total: price.lineTotal,
      });
      window.location.href = "/cart";
    } catch {
      setNotice("Could not add this artwork to cart. Try a smaller image or remove one layer.");
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f7fb] text-[#111827]">
      <ShopHeader />

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-[22px] sm:py-10">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] max-[1100px]:gap-7 max-[860px]:grid-cols-1">
          <div className="relative rounded-[32px] bg-[#f5f7fb] p-7 max-[860px]:rounded-3xl max-[860px]:p-[18px]">
            <div className="mb-[18px] flex gap-2.5 overflow-auto max-[860px]:w-full">
              {(["front", "back"] as ShirtSide[]).map((side) => (
                <button
                  key={side}
                  type="button"
                  onClick={() => setSide(side)}
                  className={`rounded-full px-[18px] py-3 text-sm font-bold capitalize max-[860px]:min-w-30 max-[860px]:flex-1 ${
                    currentView === side ? "bg-[#111827] text-white" : "bg-[#e5e7eb] text-[#111827]"
                  }`}
                >
                  {side}
                </button>
              ))}
            </div>

            <div className="absolute right-7 top-5 z-50 flex max-w-[calc(100%-210px)] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-red-500/10 bg-white/90 px-[18px] py-2.5 text-sm font-semibold text-[#111827] shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur max-[860px]:static max-[860px]:mb-4 max-[860px]:w-full max-[860px]:max-w-none max-[860px]:justify-start max-[860px]:whitespace-normal max-[860px]:rounded-[18px]">
              <span className="font-extrabold text-red-500">Important:</span>
              Keep everything inside the blue-lined card. Prints exactly as shown.
            </div>

            <div ref={stageWrapRef} className="relative mx-auto aspect-[1/1.2] w-full overflow-hidden rounded-[28px] bg-[#eef2f7] max-[860px]:rounded-[20px]">
              <Image
                src={color.images[currentView]}
                alt={`${color.name} shirt ${currentView}`}
                fill
                priority
                sizes="(max-width: 860px) calc(100vw - 80px), 760px"
                className="pointer-events-none select-none object-contain"
              />

              <Stage
                width={stageWidth}
                height={stageHeight}
                className="!absolute inset-0 z-20"
                onMouseDown={(event) => {
                  if (event.target === event.target.getStage()) {
                    setSelectedId(null);
                  }
                }}
                onTouchStart={(event) => {
                  if (event.target === event.target.getStage()) {
                    setSelectedId(null);
                  }
                }}
              >
                <Layer clipX={printArea.x} clipY={printArea.y} clipWidth={printArea.width} clipHeight={printArea.height}>
                  <Group>
                    {layers.map((layer) =>
                      layer.type === "image" ? (
                        <URLImage
                          key={layer.id}
                          layer={layer}
                          isSelected={selectedId === layer.id}
                          onSelect={() => setSelectedId(layer.id)}
                          updateLayer={updateLayer}
                          onResetSize={resetImageSize}
                        />
                      ) : (
                        <URLText
                          key={layer.id}
                          layer={layer}
                          isSelected={selectedId === layer.id}
                          onSelect={() => setSelectedId(layer.id)}
                          updateLayer={updateLayer}
                          onEdit={editTextLayer}
                        />
                      )
                    )}
                  </Group>
                </Layer>
              </Stage>

              <div
                className="pointer-events-none absolute z-30 box-border rounded-[18px] border-2 border-dashed border-blue-500/75"
                style={{
                  left: "50.5%",
                  top: "51%",
                  width: "30%",
                  height: "39%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>

            <p className="mt-4 rounded-[18px] bg-white/80 px-4 py-3 text-sm font-semibold text-[#4b5563] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
              {notice}
            </p>
          </div>

          <aside className="flex flex-col gap-[18px] rounded-[28px] bg-white p-7 shadow-[0_10px_28px_rgba(0,0,0,0.05)] max-[860px]:rounded-3xl max-[860px]:p-[22px] max-[480px]:p-[18px]">
            <h1 className="mb-2 text-[52px] font-black leading-[0.92] tracking-[-0.05em] max-[1100px]:text-[42px] max-[860px]:text-[34px] max-[480px]:text-3xl">
              Customize T-Shirts
            </h1>
            <div className="h-px bg-black/5" />

            <label className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">Upload Design(s)</label>
            <input
              className="w-full rounded-[20px] border-2 border-dashed border-indigo-500/20 bg-[#fafbff] p-[18px] text-base"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={handleUpload}
            />

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

            <label className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">Font and Text Color</label>
            <select
              value={fontFamily}
              onChange={(event) => {
                setFontFamily(event.target.value);

                if (selectedTextLayer) {
                  updateLayer(selectedTextLayer.id, { fontFamily: event.target.value });
                }
              }}
              className="h-[58px] w-full rounded-[18px] border border-slate-950/10 bg-white px-4 text-base"
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font}>
                  {font === "Brush Script MT" ? "Brush Script" : font === "Comic Sans MS" ? "Comic Sans" : font}
                </option>
              ))}
            </select>

            <label className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">Text Color</label>
            <input
              type="color"
              value={textColor}
              onChange={(event) => {
                setTextColor(event.target.value);

                if (selectedTextLayer) {
                  updateLayer(selectedTextLayer.id, { fill: event.target.value });
                }
              }}
              className="h-[52px] w-full rounded-2xl border border-slate-950/10 bg-white p-1.5"
            />

            {selectedTextLayer && (
              <>
                <label className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">Selected Text</label>
                <input
                  value={selectedTextLayer.text ?? ""}
                  onChange={(event) => updateLayer(selectedTextLayer.id, { text: event.target.value })}
                  className="h-[58px] w-full rounded-[18px] border border-slate-950/10 bg-white px-4 text-base"
                />
              </>
            )}

            <div className="grid grid-cols-2 gap-3 max-[860px]:grid-cols-1">
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

            <Link
              href="/designer"
              className="relative flex min-h-14 w-full items-center justify-center overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#8b5cf6_0%,#6366f1_45%,#3b82f6_100%)] px-4 py-3 text-center text-[15px] font-extrabold tracking-[0.02em] text-white no-underline shadow-[0_14px_34px_rgba(99,102,241,0.24)] transition hover:-translate-y-0.5"
            >
              Create New Design
            </Link>

            <button type="button" disabled={isRemovingBg} onClick={removeBackground} className="prntd-gradient-btn disabled:cursor-not-allowed disabled:opacity-70">
              {isRemovingBg ? (
                <>
                  <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/25 border-t-white" />
                  Removing Background...
                </>
              ) : (
                "Remove Image Background - 2 Credits"
              )}
            </button>

            <div className="grid grid-cols-2 gap-3 max-[860px]:grid-cols-1">
              <button type="button" onClick={() => moveSelectedLayer("backward")} className="prntd-gradient-btn">
                Send Backward
              </button>
              <button type="button" onClick={() => moveSelectedLayer("forward")} className="prntd-gradient-btn">
                Bring Forward
              </button>
            </div>

            <label className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
  Quantity
</label>

{selectedProduct.id === "business-cards" ? (
  <select
    value={quantity}
    onChange={(event) =>
      setQuantity(
        Number(
          event.target.value,
        ),
      )
    }
    className="h-[58px] w-full rounded-[18px] border border-slate-950/10 bg-white px-[18px] text-base"
  >
    {[50, 100, 250, 500, 1000].map(
      (qty) => (
        <option
          key={qty}
          value={qty}
        >
          {qty} Cards
        </option>
      ),
    )}
  </select>
) : (
  <input
    className="h-[58px] w-full rounded-[18px] border border-slate-950/10 bg-white px-[18px] text-base"
    type="number"
    min={1}
    value={quantity}
    onChange={(event) =>
      setQuantity(
        Math.max(
          1,
          Number(
            event.target.value,
          ),
        ),
      )
    }
  />
)}

            <label className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">Size</label>
            <select
              value={size}
              onChange={(event) => setSize(event.target.value)}
              className="h-[58px] w-full rounded-[18px] border border-slate-950/10 bg-white px-4 text-base"
            >
              {shirtSizes.map((shirtSize) => (
                <option key={shirtSize} value={shirtSize}>
                  {shirtSize}
                </option>
              ))}
            </select>

            <label className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">Shirt Color</label>
            <div className="flex flex-wrap gap-3">
              {shirtColors.map((shirtColor) => (
                <button
                  key={shirtColor.key}
                  type="button"
                  aria-label={`${shirtColor.name} Shirt`}
                  title={shirtColor.name}
                  onClick={() => setCurrentColorKey(shirtColor.key)}
                  className={`h-11 w-11 rounded-full border-[3px] ${
                    currentColorKey === shirtColor.key ? "border-[#7c3aed]" : "border-transparent"
                  }`}
                  style={{ background: shirtColor.swatch }}
                />
              ))}
            </div>

            <div className="mt-2 flex flex-col gap-[18px] rounded-3xl bg-[#f5f7fb] p-[22px]">
              <div className="flex items-start justify-between gap-5 max-[640px]:flex-col">
                <div>
                  <p className="text-[15px] font-bold text-[#111827]">Estimated Total</p>
                  <p className="mt-1 text-[13px] text-[#6b7280]">Pricing updates automatically</p>
                </div>
                <strong className="text-right text-[34px] font-extrabold leading-none text-[#111827] max-[640px]:text-left max-[640px]:text-[30px]">
                  {formatMoney(price.lineTotal)}
                  {price.perShirtDiscount > 0 && (
                    <span className="block pt-2 text-sm font-bold text-[#7c3aed]">
                      -{formatMoney(price.perShirtDiscount)}/shirt
                    </span>
                  )}
                </strong>
              </div>

              <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
                <div className="rounded-[18px] border border-violet-600/10 bg-white p-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
                  <p className="text-xs font-bold uppercase tracking-[0.04em] text-[#7c3aed]">2+ Shirts</p>
                  <p className="mt-1.5 text-base font-extrabold text-[#111827]">Save $11/shirt</p>
                </div>
                <div className="rounded-[18px] border border-violet-600/10 bg-white p-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
                  <p className="text-xs font-bold uppercase tracking-[0.04em] text-[#7c3aed]">6+ Shirts</p>
                  <p className="mt-1.5 text-base font-extrabold text-[#111827]">Save $20/shirt</p>
                </div>
              </div>

              <p className="rounded-[14px] bg-[#eef2ff] px-3.5 py-3 text-[13px] font-semibold text-[#4b5563]">
                Double-sided printing costs extra. Current print type: {price.printType}.
              </p>
            </div>

            <button type="button" onClick={addToCart} className="prntd-gradient-btn">
              Add To Cart
            </button>

            <div className="rounded-[18px] border border-orange-600/10 bg-[#fff7ed] px-[18px] py-4 text-[13px] leading-[1.55] text-[#7c2d12]">
              <p>By uploading or creating a design, you confirm that:</p>
              <ul className="ml-[18px] mt-2.5 list-disc space-y-1.5">
                <li>You own the rights to the artwork, logo, image, text, or content uploaded.</li>
                <li>Or you have obtained proper permission or licensing to use it.</li>
                <li>Your design does not infringe any copyright, trademark, intellectual property, or third-party rights.</li>
                <li>Your content does not contain illegal, hateful, explicit, or prohibited material.</li>
              </ul>
              <p className="mt-2.5">
                PRNTD reserves the right to refuse, cancel, or remove any order(s) containing content believed to violate
                intellectual property rights or applicable laws.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}