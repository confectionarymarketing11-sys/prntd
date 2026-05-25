"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Wand2,
  Mic,
  Download,
  RefreshCw,
  Layers3,
} from "lucide-react";

import ShopHeader from "@/components/ShopHeader";
import { usePrntdAccount } from "@/hooks/usePrntdAccount";

type ProductChoice = {
  label: string;
  value: string;
};

type GenerationResult = {
  imageUrl?: string;
  image?: string;
  url?: string;
  designId?: string | null;
  designPath?: string;
  error?: string;
};

type SpeechRecognitionConstructor = new () => {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  onresult:
    | ((
        event: {
          results: ArrayLike<
            ArrayLike<{
              transcript: string;
            }>
          >;
        },
      ) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

const apiBase = "/api/prntd";

const products: ProductChoice[] = [
  {
    label: "Business Card",
    value: "business card design,",
  },
  {
    label: "Sticker",
    value: "sticker design,",
  },
  {
    label: "Shirt",
    value: "apparel graphic design,",
  },
  {
    label: "Label",
    value: "product label design,",
  },
  {
    label: "Logo",
    value: "logo design,",
  },
];

const styleTemplates: Record<
  string,
  string[]
> = {
  luxury: ["luxurious style"],
  minimal: ["minimalist style"],
  watercolor: ["watercolor style"],
  streetwear: ["streetwear style"],
  text: ["text"],
  cartoon: ["cartoon style"],
  cyberpunk: ["cyberpunk style"],
  bold: ["bold style"],
  vintage: ["retro vintage style"],"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ShopHeader from "@/components/ShopHeader";
import { usePrntdAccount } from "@/hooks/usePrntdAccount";

type ProductChoice = {
  label: string;
  value: string;
};

type GenerationResult = {
  imageUrl?: string;
  image?: string;
  url?: string;
  designId?: string | null;
  designPath?: string;
  error?: string;
};

type SpeechRecognitionConstructor = new () => {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

const apiBase = "/api/prntd";

const products: ProductChoice[] = [
  { label: "Business Card", value: "business card design," },
  { label: "Sticker", value: "sticker design," },
  { label: "Shirt", value: "apparel graphic design," },
  { label: "Label", value: "product label design," },
  { label: "Logo", value: "logo design," },
];

const styleTemplates: Record<string, string[]> = {
  luxury: ["luxurious style"],
  minimal: ["minimalist style"],
  watercolor: ["watercolor style"],
  streetwear: ["streetwear style"],
  text: ["text"],
  cartoon: ["cartoon style"],
  cyberpunk: ["cyberpunk style"],
  bold: ["bold style"],
  vintage: ["retro vintage style"],
  modern: ["modern style"],
  photorealistic: ["photorealistic style"],
  anime: ["anime style"],
  professional: ["professional style"],
  urban: ["urban style"],
  futuristic: ["high-tech futuristic style"],
  pencil: ["pencil style"],
};

const styleOptions = [
  "luxury",
  "minimal",
  "bold",
  "modern",
  "professional",
  "vintage",
  "retro",
  "urban",
  "streetwear",
  "anime",
  "cartoon",
  "futuristic",
  "cyberpunk",
  "pencil",
  "watercolor",
  "photorealistic",
  "text",
];

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") return undefined;

  return (
    (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor })
      .SpeechRecognition ??
    (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor })
      .webkitSpeechRecognition
  );
}

function pickStyleText(style: string) {
  const source = styleTemplates[style] ?? [`${style} style`];
  return source[Math.floor(Math.random() * source.length)];
}

function downloadImage(url: string) {
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const localUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = localUrl;
      anchor.download = `design-${Date.now()}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(localUrl);
    })
    .catch(() => {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `design-${Date.now()}.png`;
      anchor.target = "_blank";
      document.body.appendChild(anchor);
      anchor.click();"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ShopHeader from "@/components/ShopHeader";
import { usePrntdAccount } from "@/hooks/usePrntdAccount";

type ProductChoice = {
  label: string;
  value: string;
};

type GenerationResult = {
  imageUrl?: string;
  image?: string;
  url?: string;
  designId?: string | null;
  designPath?: string;
  error?: string;
};

type SpeechRecognitionConstructor = new () => {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

const apiBase = "/api/prntd";

const products: ProductChoice[] = [
  { label: "Business Card", value: "business card design," },
  { label: "Sticker", value: "sticker design," },
  { label: "Shirt", value: "apparel graphic design," },
  { label: "Label", value: "product label design," },
  { label: "Logo", value: "logo design," },
];

const styleTemplates: Record<string, string[]> = {
  luxury: ["luxurious style"],
  minimal: ["minimalist style"],
  watercolor: ["watercolor style"],
  streetwear: ["streetwear style"],
  text: ["text"],
  cartoon: ["cartoon style"],
  cyberpunk: ["cyberpunk style"],
  bold: ["bold style"],
  vintage: ["retro vintage style"],
  modern: ["modern style"],
  photorealistic: ["photorealistic style"],
  anime: ["anime style"],
  professional: ["professional style"],
  urban: ["urban style"],
  futuristic: ["high-tech futuristic style"],
  pencil: ["pencil style"],
};

const styleOptions = [
  "luxury",
  "minimal",
  "bold",
  "modern",
  "professional",
  "vintage",
  "retro",
  "urban",
  "streetwear",
  "anime",
  "cartoon",
  "futuristic",
  "cyberpunk",
  "pencil",
  "watercolor",
  "photorealistic",
  "text",
];

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") return undefined;

  return (
    (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor })
      .SpeechRecognition ??
    (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor })
      .webkitSpeechRecognition
  );
}

function pickStyleText(style: string) {
  const source = styleTemplates[style] ?? [`${style} style`];
  return source[Math.floor(Math.random() * source.length)];
}

function downloadImage(url: string) {
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const localUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = localUrl;
      anchor.download = `design-${Date.now()}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(localUrl);
    })
    .catch(() => {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `design-${Date.now()}.png`;
      anchor.target = "_blank";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    });
}

export default function DesignGeneratorPage() {
  const { email, token: accountToken, status: accountStatus, loadAccount } = usePrntdAccount();
  const [authToken, setAuthToken] = useState("");
  const [credits, setCredits] = useState("Credits: --");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [styleTexts, setStyleTexts] = useState<Record<string, string>>({});
  const [brandDetails, setBrandDetails] = useState("");
  const [businessCardDetails, setBusinessCardDetails] = useState("");
  const [industry, setIndustry] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [quality, setQuality] = useState("standard");
  const [transparentBackground, setTransparentBackground] = useState("true");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("Preparing your design...");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [resultImage, setResultImage] = useState("");
  const [editRequest, setEditRequest] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(() => Boolean(getSpeechRecognitionConstructor()));
  const [voiceListening, setVoiceListening] = useState(false);
  const generationInterval = useRef<number | null>(null);
  const editInterval = useRef<number | null>(null);

  const prompt = useMemo(() => {
    const parts: string[] = [];

    if (selectedProduct) parts.push(selectedProduct);

    const chosenStyles = selectedStyles.map((style) => styleTexts[style]).filter(Boolean);

    if (chosenStyles.length > 0) parts.push(`with ${chosenStyles.join(", ")}`);
    if (industry.trim()) parts.push(`for a ${industry.trim()}`);
    if (colors.length > 0) parts.push(`using colors: ${colors.join(", ")}`);
    if (brandDetails.trim()) parts.push(`details: ${brandDetails.trim()}`);
    if (businessCardDetails.trim()) parts.push(`business card details include: ${businessCardDetails.trim()}`);

    return parts.join(" ");
  }, [selectedProduct, selectedStyles, styleTexts, industry, colors, brandDetails, businessCardDetails]);

  const generateButtonText = useMemo(() => {
    if (!selectedProduct) return "Choose a Product First";
    if (selectedProduct.toLowerCase().includes("business card") && !businessCardDetails.trim()) {
      return "Please Enter Business Card Details";
    }
    if (!selectedProduct.toLowerCase().includes("business card") && !brandDetails.trim()) {
      return "Please Enter Design Details";
    }

    return "Create Your Design";
  }, [selectedProduct, businessCardDetails, brandDetails]);

  const loadDesignCredits = useCallback(async (nextToken = authToken) => {
    if (!nextToken) {
      setCredits("Credits: --");
      return;
    }

    try {
      const response = await fetch(`${apiBase}/credits`, {
        headers: {
          Authorization: `Bearer ${nextToken}`,
        },
      });
      const data = (await response.json()) as {
        total_credits?: number;
        credits?: number;
        subscription_credits?: number;
      };
      const total = data.total_credits ?? Number(data.credits ?? 0) + Number(data.subscription_credits ?? 0);

      setCredits(`Credits: ${total}`);
    } catch {
      setCredits("Credits: --");
    }
  }, [authToken]);

  useEffect(() => {
    if (!accountToken) return;
    const timer = window.setTimeout(() => {
      void loadDesignCredits(accountToken);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [accountToken, loadDesignCredits]);

  async function ensureAuthToken() {
    if (authToken || accountToken) return authToken || accountToken;
    const session = accountToken ? { token: accountToken } : await loadAccount();

    if (!session?.token) return "";

    setAuthToken(session.token);
    await loadDesignCredits(session.token);
    return session.token;
  }

  function selectProduct(product: ProductChoice) {
    setSelectedProduct(product.value);
    setSelectedStyles([]);
    setStyleTexts({});
    setColors([]);
    setIndustry("");
    setResult(null);
    setResultImage("");
  }

  function toggleStyle(style: string) {
    if (selectedStyles.includes(style)) {
      setSelectedStyles((current) => current.filter((item) => item !== style));
      setStyleTexts((current) => {
        const next = { ...current };
        delete next[style];
        return next;
      });
      return;
    }

    setSelectedStyles((current) => [...current, style]);
    setStyleTexts((current) => ({ ...current, [style]: pickStyleText(style) }));
  }

  function addColorValue(value = colorInput) {
    const cleanValue = value.trim();

    if (!cleanValue || colors.includes(cleanValue)) return;

    setColors((current) => [...current, cleanValue]);
    setColorInput("");
  }

  function startFakeLoading(mode: "generate" | "edit") {
    const isUltra = quality === "ultra" && mode === "generate";
    let nextProgress = 0;
    const intervalRef = mode === "generate" ? generationInterval : editInterval;

    if (intervalRef.current) window.clearInterval(intervalRef.current);

    setProgress(0);
    setProgressText(isUltra ? "Ultra quality can take a little longer..." : mode === "edit" ? "Reviewing your current design..." : "Preparing your design...");

    intervalRef.current = window.setInterval(() => {
      if (isUltra) {
        if (nextProgress < 8) {
          nextProgress += 0.7;
          setProgressText("Preparing ultra quality render...");
        } else if (nextProgress < 20) {
          nextProgress += 0.5;
          setProgressText("Building detailed composition...");
        } else if (nextProgress < 40) {
          nextProgress += 0.35;
          setProgressText("Rendering enhanced details...");
        } else if (nextProgress < 60) {
          nextProgress += 0.22;
          setProgressText("Applying ultra quality refinements...");
        } else if (nextProgress < 78) {
          nextProgress += 0.12;
          setProgressText("Enhancing textures and print quality...");
        } else if (nextProgress < 88) {
          nextProgress += 0.06;
          setProgressText("Final ultra quality rendering...");
        } else if (nextProgress < 94) {
          nextProgress += 0.025;
          setProgressText("Almost finished...");
        }
      } else if (mode === "edit") {
        if (nextProgress < 25) {
          nextProgress += 2;
          setProgressText("Reviewing your current design...");
        } else if (nextProgress < 55) {
          nextProgress += 1.25;
          setProgressText("Applying requested changes...");
        } else if (nextProgress < 88) {
          nextProgress += 0.55;
          setProgressText("Generating updated version...");
        } else if (nextProgress < 95) {
          nextProgress += 0.2;
          setProgressText("Almost done...");
        }
      } else if (nextProgress < 15) {
        nextProgress += 2;
        setProgressText("Preparing your design...");
      } else if (nextProgress < 40) {
        nextProgress += 1.5;
        setProgressText("Getting your design ready...");
      } else if (nextProgress < 70) {
        nextProgress += 1;
        setProgressText("Creating your concept...");
      } else if (nextProgress < 90) {
        nextProgress += 0.5;
        setProgressText("Finalizing your design...");
      } else if (nextProgress < 95) {
        nextProgress += 0.2;
        setProgressText("Almost done...");
      }

      setProgress(Math.min(nextProgress, 95));
    }, 300);
  }

  function finishFakeLoading(mode: "generate" | "edit") {
    const intervalRef = mode === "generate" ? generationInterval : editInterval;

    if (intervalRef.current) window.clearInterval(intervalRef.current);

    setProgress(100);
    setProgressText(mode === "edit" ? "Update complete!" : "Design complete!");
    window.setTimeout(() => setProgress(0), 700);
  }

  async function runGeneration() {
    if (!selectedProduct) {
      alert("Please choose what you're creating first.");
      return;
    }

    if (!brandDetails.trim() && !businessCardDetails.trim()) {
      alert("Please add your design details first.");
      return;
    }

    if (quality === "ultra" && transparentBackground === "true") {
      alert("Ultra quality currently does not support transparent backgrounds.");
      return;
    }

    const token = await ensureAuthToken();

    if (!token) {
      alert("Sign in before creating a design.");
      return;
    }

    setIsGenerating(true);
    setResult(null);
    setResultImage("");
    startFakeLoading("generate");

    try {
      const response = await fetch(`${apiBase}/generate-design`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          productType: selectedProduct,
          quality,
          transparentBackground: transparentBackground === "true",
        }),
      });
      const data = (await response.json()) as GenerationResult;

      if (!response.ok) {
        throw new Error(data.error ?? "Generation failed");
      }

      const image = data.imageUrl ?? data.image ?? data.url ?? "";

      if (!image) {
        throw new Error("No image returned from backend");
      }

      setResult(data);
      setResultImage(image);
      finishFakeLoading("generate");
      downloadImage(image);
      await loadDesignCredits(token);
    } catch (error) {
      if (generationInterval.current) window.clearInterval(generationInterval.current);
      setProgressText(error instanceof Error ? error.message : "Something went wrong. Please try again.");
      setResult({ error: error instanceof Error ? error.message : "Generation failed." });
    } finally {
      setIsGenerating(false);
    }
  }

  async function runEdit() {
    if (!resultImage || !editRequest.trim()) {
      alert("Describe the changes you'd like first.");
      return;
    }

    const token = await ensureAuthToken();

    if (!token) {
      alert("Sign in before editing a design.");
      return;
    }

    setIsEditing(true);
    startFakeLoading("edit");

    try {
      const response = await fetch(resultImage);
      const imageBlob = await response.blob();
      const formData = new FormData();
      formData.append("image", imageBlob, "design.png");
      formData.append("editRequest", editRequest);

      const editResponse = await fetch(`${apiBase}/edit-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = (await editResponse.json()) as GenerationResult;

      if (!editResponse.ok) {
        throw new Error(data.error ?? "Edit failed");
      }

      const image = data.imageUrl ?? data.image ?? data.url ?? "";

      if (!image) throw new Error("No image returned from edit.");

      setResult(data);
      setResultImage(image);
      setEditRequest("");
      finishFakeLoading("edit");
      downloadImage(image);
      await loadDesignCredits(token);
    } catch (error) {
      if (editInterval.current) window.clearInterval(editInterval.current);
      setProgressText(error instanceof Error ? error.message : "Edit failed.");
    } finally {
      setIsEditing(false);
    }
  }

  function startVoice() {
    const Recognition = getSpeechRecognitionConstructor();

    if (!Recognition) {
      setVoiceSupported(false);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      let transcript = "";

      for (let index = 0; index < event.results.length; index += 1) {
        transcript += `${event.results[index][0].transcript} `;
      }

      setBrandDetails(transcript.trim());
    };
    recognition.onerror = () => setVoiceListening(false);
    recognition.onend = () => setVoiceListening(false);
    setVoiceListening(true);
    recognition.start();
  }

  function applyToProduct() {
    if (!resultImage) return;

    localStorage.setItem("prntd_generated_image", resultImage);
    localStorage.setItem(
      "prntd_design",
      JSON.stringify({
        image: resultImage,
        designId: result?.designId,
        designPath: result?.designPath,
        type: "generated-design",
      })
    );

    const product = selectedProduct.toLowerCase();

    if (product.includes("shirt") || product.includes("apparel")) {
      localStorage.setItem("prntd_product", "tshirt");
      window.location.href = "/designer";
      return;
    }

    if (product.includes("sticker")) {
      localStorage.setItem("prntd_product", "sticker");
    } else if (product.includes("business card")) {
      localStorage.setItem("prntd_product", "businesscard");
    } else if (product.includes("label")) {
      localStorage.setItem("prntd_product", "label");
    } else {
      localStorage.setItem("prntd_product", "product");
    }

    window.location.href = "/products";
  }

  const showBusinessCard = selectedProduct.toLowerCase().includes("business card");
  const hasProgress = isGenerating || isEditing || progress > 0;

  return (
  <main className="min-h-screen bg-[#020617] text-white">
    <ShopHeader />

    <section className="mx-auto w-full max-w-[1400px] px-5 py-[55px] pb-[90px]">
      <div className="mb-[42px] rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,#020617_0%,#0f172a_50%,#312e81_100%)] p-10 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-black uppercase tracking-[0.22em] text-slate-300">
              PRNTD Studio
            </div>

            <h1 className="mb-5 text-[clamp(52px,6vw,92px)] font-black leading-[0.95] tracking-[-0.04em]">
              Generate
              <br />
              <span className="bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#c084fc_100%)] bg-clip-text text-transparent">
                Premium Designs
              </span>
            </h1>

            <p className="max-w-[760px] text-lg leading-[1.8] text-slate-400">
              Create custom shirts, logos, labels, stickers, and business cards with modern AI-powered design tools.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/subscriptions"
                className="flex h-[56px] items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#2563eb_0%,#7c3aed_100%)] px-7 text-sm font-extrabold text-white shadow-[0_20px_40px_rgba(99,102,241,0.35)] transition hover:scale-[1.02]"
              >
                Buy Credits
              </Link>

              <Link
                href="/dashboard"
                className="flex h-[56px] items-center justify-center rounded-[18px] border border-white/10 bg-white/5 px-7 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Open Dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Creator Account
            </p>

            <p className="mt-3 break-words text-[34px] font-black leading-tight text-white">
              {email || "Loading..."}
            </p>

            <p className="mt-2 text-sm text-slate-400">{accountStatus}</p>

            <div className="mt-7 rounded-[24px] border border-white/10 bg-[#0b1120] p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Credits
              </p>

              <p className="mt-3 text-[64px] font-black leading-none text-white">
                {credits.replace("Credits: ", "")}
              </p>

              <p className="mt-3 text-sm text-slate-400">
                Each generation uses 1 credit.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-[26px] lg:grid-cols-[minmax(0,1fr)_400px] max-[1100px]:grid-cols-1">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-[30px] shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl max-[640px]:p-[22px]">
          <section className="mb-8">
            <h2 className="mb-2.5 text-2xl font-extrabold text-white">
              Product Type
            </h2>

            <p className="mb-[18px] text-sm leading-7 text-slate-400">
              Select what you'd like to create.
            </p>

            <div className="grid grid-cols-5 gap-3.5 max-[900px]:grid-cols-3 max-[640px]:grid-cols-2">
              {products.map((product) => (
                <button
                  key={product.value}
                  type="button"
                  onClick={() => selectProduct(product)}
                  className={`min-h-[88px] rounded-[24px] border p-4 text-left text-[14px] font-bold transition hover:-translate-y-0.5 ${
                    selectedProduct === product.value
                      ? "border-white/10 bg-[linear-gradient(135deg,#2563eb_0%,#7c3aed_50%,#9333ea_100%)] text-white shadow-[0_20px_40px_rgba(99,102,241,0.35)]"
                      : "border-white/10 bg-[linear-gradient(135deg,#111827_0%,#1e293b_45%,#312e81_100%)] text-slate-300 hover:shadow-[0_12px_26px_rgba(99,102,241,0.18)]"
                  }`}
                >
                  <div className="text-lg font-black">{product.label}</div>

                  <div className="mt-2 text-xs text-slate-400">
                    premium graphics.
                  </div>
                </button>
              ))}
            </div>
          </section>

          {!showBusinessCard && (
            <section className="mb-8">
              <h2 className="mb-2.5 text-2xl font-extrabold text-white">
                Describe Your Design
              </h2>

              <p className="mb-[18px] text-sm leading-7 text-slate-400">
                Explain your idea, layout, text, colors, branding, or style.
              </p>

              <div className="relative">
                <textarea
                  value={brandDetails}
                  onChange={(event) => setBrandDetails(event.target.value)}
                  className="min-h-[170px] w-full resize-y rounded-[22px] border border-white/10 bg-[#020617] p-[18px] pr-[70px] text-[15px] text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  placeholder="Example: Modern streetwear shirt with chrome typography and neon blue accents."
                />

                {voiceSupported && (
                  <button
                    type="button"
                    onClick={startVoice}
                    className={`absolute bottom-3.5 right-3.5 flex h-11 w-11 items-center justify-center rounded-[14px] text-sm font-black text-white shadow-[0_10px_25px_rgba(99,102,241,0.35)] ${
                      voiceListening
                        ? "bg-[linear-gradient(135deg,#ef4444,#dc2626)]"
                        : "bg-[linear-gradient(135deg,#2563eb,#7c3aed)]"
                    }`}
                  >
                    Mic
                  </button>
                )}
              </div>
            </section>
          )}

          {showBusinessCard && (
            <section className="mb-8">
              <h2 className="mb-2.5 text-2xl font-extrabold text-white">
                Business Card Details
              </h2>

              <textarea
                value={businessCardDetails}
                onChange={(event) =>
                  setBusinessCardDetails(event.target.value)
                }
                className="min-h-[170px] w-full resize-y rounded-[22px] border border-white/10 bg-[#020617] p-[18px] text-[15px] text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                placeholder={`Business Name:\nYour Name:\nPhone:\nEmail:\nWebsite:`}
              />
            </section>
          )}

          <section className="mb-8">
            <h2 className="mb-2.5 text-2xl font-extrabold text-white">
              Choose a Style
            </h2>

            <div className="flex flex-wrap gap-3">
              {styleOptions.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => toggleStyle(style)}
                  className={`rounded-full border px-[18px] py-3 text-sm font-bold capitalize transition ${
                    selectedStyles.includes(style)
                      ? "border-white/10 bg-[linear-gradient(135deg,#2563eb_0%,#7c3aed_50%,#9333ea_100%)] text-white shadow-[0_14px_30px_rgba(99,102,241,0.25)]"
                      : "border-white/10 bg-[#111827] text-slate-300 hover:bg-[#1e293b]"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </section>

          <section className="mb-8 grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="mb-2.5 text-2xl font-extrabold text-white">
                Design Quality
              </h2>

              <select
                value={quality}
                onChange={(event) => {
                  const nextQuality = event.target.value;

                  setQuality(nextQuality);
                  setTransparentBackground(
                    nextQuality === "ultra" ? "false" : "true"
                  );
                }}
                className="h-[58px] w-full rounded-[20px] border border-white/10 bg-[#020617] px-[17px] text-[15px] text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
              >
                <option value="basic">
                  Fastest Speed - Basic Quality - (25secs)
                </option>

                <option value="standard">
                  Medium Speed - High Quality - (40secs)
                </option>

                <option value="premium">
                  Medium Speed - Best Quality - (1 min)
                </option>

                <option value="ultra">
                  Slowest Speed - Ultra Quality - (3 mins)
                </option>
              </select>
            </div>

            <div>
              <h2 className="mb-2.5 text-2xl font-extrabold text-white">
                Transparent Background
              </h2>

              <select
                value={transparentBackground}
                disabled={quality === "ultra"}
                onChange={(event) =>
                  setTransparentBackground(event.target.value)
                }
                className="h-[58px] w-full rounded-[20px] border border-white/10 bg-[#020617] px-[17px] text-[15px] text-white outline-none disabled:opacity-60 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
              >
                <option value="false">Off</option>
                <option value="true">On</option>
              </select>
            </div>
          </section>

          <button
            type="button"
            onClick={runGeneration}
            disabled={isGenerating}
            className="mt-5 flex h-[62px] w-full items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#2563eb_0%,#7c3aed_100%)] text-[15px] font-extrabold text-white shadow-[0_20px_40px_rgba(99,102,241,0.35)] transition hover:scale-[1.01] disabled:opacity-60"
          >
            {isGenerating ? "Creating..." : generateButtonText}
          </button>

          {hasProgress && (
            <div className="mt-6">
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-[linear-gradient(135deg,#2563eb_0%,#7c3aed_100%)] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="mt-3 text-center text-sm text-slate-400">
                {progressText}
              </p>
            </div>
          )}
        </div>

        <aside className="sticky top-5 rounded-[30px] border border-white/10 bg-white/[0.03] p-[30px] shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl max-[1100px]:relative max-[1100px]:top-auto max-[640px]:p-[22px]">
          <h2 className="mb-2.5 text-2xl font-extrabold text-white">
            Live Preview
          </h2>

          <div className="min-h-[500px] rounded-3xl border border-white/10 bg-[#020617] p-5">
            {!resultImage && !result?.error && (
              <div className="pt-[100px] text-center">
                <h3 className="mb-3 text-2xl font-black text-white">
                  Your Design Preview
                </h3>

                <p className="text-slate-400">
                  Generated designs appear here.
                </p>
              </div>
            )}

            {result?.error && (
              <div className="rounded-[18px] border border-red-500/20 bg-red-500/10 p-5 text-center">
                <p className="text-base text-white">{result.error}</p>
              </div>
            )}

            {resultImage && (
              <div className="text-center">
                <img
                  src={resultImage}
                  alt="Generated design"
                  className="w-full rounded-[24px] bg-[linear-gradient(45deg,#111827_25%,transparent_25%),linear-gradient(-45deg,#111827_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#111827_75%),linear-gradient(-45deg,transparent_75%,#111827_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0px] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
                />

                <p className="mt-5 text-sm leading-7 text-slate-400">
                  Download finishes automatically after generation.
                </p>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <textarea
                    value={editRequest}
                    onChange={(event) =>
                      setEditRequest(event.target.value)
                    }
                    className="min-h-[120px] w-full rounded-[22px] border border-white/10 bg-[#020617] p-[18px] text-[15px] text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                    placeholder="Describe the changes you'd like..."
                  />

                  <button
                    type="button"
                    onClick={runEdit}
                    disabled={isEditing}
                    className="mt-5 flex h-[58px] w-full items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#2563eb_0%,#7c3aed_100%)] text-sm font-extrabold text-white shadow-[0_20px_40px_rgba(99,102,241,0.35)] transition hover:scale-[1.01]"
                  >
                    {isEditing ? "Updating..." : "Update Design - 1 Credit"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setResultImage("");
                    setEditRequest("");
                  }}
                  className="mt-4 flex h-[58px] w-full items-center justify-center rounded-[20px] border border-white/10 bg-white/5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  New Design
                </button>

                <button
                  type="button"
                  onClick={applyToProduct}
                  className="mt-4 flex h-[58px] w-full items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#2563eb_0%,#7c3aed_100%)] text-sm font-extrabold text-white shadow-[0_20px_40px_rgba(99,102,241,0.35)] transition hover:scale-[1.01]"
                >
                  Apply To Product
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  </main>
);
      anchor.remove();
    });
}

export default function DesignGeneratorPage() {
  const { email, token: accountToken, status: accountStatus, loadAccount } = usePrntdAccount();
  const [authToken, setAuthToken] = useState("");
  const [credits, setCredits] = useState("Credits: --");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [styleTexts, setStyleTexts] = useState<Record<string, string>>({});
  const [brandDetails, setBrandDetails] = useState("");
  const [businessCardDetails, setBusinessCardDetails] = useState("");
  const [industry, setIndustry] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [quality, setQuality] = useState("standard");
  const [transparentBackground, setTransparentBackground] = useState("true");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("Preparing your design...");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [resultImage, setResultImage] = useState("");
  const [editRequest, setEditRequest] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(() => Boolean(getSpeechRecognitionConstructor()));
  const [voiceListening, setVoiceListening] = useState(false);
  const generationInterval = useRef<number | null>(null);
  const editInterval = useRef<number | null>(null);

  const prompt = useMemo(() => {
    const parts: string[] = [];

    if (selectedProduct) parts.push(selectedProduct);

    const chosenStyles = selectedStyles.map((style) => styleTexts[style]).filter(Boolean);

    if (chosenStyles.length > 0) parts.push(`with ${chosenStyles.join(", ")}`);
    if (industry.trim()) parts.push(`for a ${industry.trim()}`);
    if (colors.length > 0) parts.push(`using colors: ${colors.join(", ")}`);
    if (brandDetails.trim()) parts.push(`details: ${brandDetails.trim()}`);
    if (businessCardDetails.trim()) parts.push(`business card details include: ${businessCardDetails.trim()}`);

    return parts.join(" ");
  }, [selectedProduct, selectedStyles, styleTexts, industry, colors, brandDetails, businessCardDetails]);

  const generateButtonText = useMemo(() => {
    if (!selectedProduct) return "Choose a Product First";
    if (selectedProduct.toLowerCase().includes("business card") && !businessCardDetails.trim()) {
      return "Please Enter Business Card Details";
    }
    if (!selectedProduct.toLowerCase().includes("business card") && !brandDetails.trim()) {
      return "Please Enter Design Details";
    }

    return "Create Your Design";
  }, [selectedProduct, businessCardDetails, brandDetails]);

  const loadDesignCredits = useCallback(async (nextToken = authToken) => {
    if (!nextToken) {
      setCredits("Credits: --");
      return;
    }

    try {
      const response = await fetch(`${apiBase}/credits`, {
        headers: {
          Authorization: `Bearer ${nextToken}`,
        },
      });
      const data = (await response.json()) as {
        total_credits?: number;
        credits?: number;
        subscription_credits?: number;
      };
      const total = data.total_credits ?? Number(data.credits ?? 0) + Number(data.subscription_credits ?? 0);

      setCredits(`Credits: ${total}`);
    } catch {
      setCredits("Credits: --");
    }
  }, [authToken]);

  useEffect(() => {
    if (!accountToken) return;
    const timer = window.setTimeout(() => {
      void loadDesignCredits(accountToken);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [accountToken, loadDesignCredits]);

  async function ensureAuthToken() {
    if (authToken || accountToken) return authToken || accountToken;
    const session = accountToken ? { token: accountToken } : await loadAccount();

    if (!session?.token) return "";

    setAuthToken(session.token);
    await loadDesignCredits(session.token);
    return session.token;
  }

  function selectProduct(product: ProductChoice) {
    setSelectedProduct(product.value);
    setSelectedStyles([]);
    setStyleTexts({});
    setColors([]);
    setIndustry("");
    setResult(null);
    setResultImage("");
  }

  function toggleStyle(style: string) {
    if (selectedStyles.includes(style)) {
      setSelectedStyles((current) => current.filter((item) => item !== style));
      setStyleTexts((current) => {
        const next = { ...current };
        delete next[style];
        return next;
      });
      return;
    }

    setSelectedStyles((current) => [...current, style]);
    setStyleTexts((current) => ({ ...current, [style]: pickStyleText(style) }));
  }

  function addColorValue(value = colorInput) {
    const cleanValue = value.trim();

    if (!cleanValue || colors.includes(cleanValue)) return;

    setColors((current) => [...current, cleanValue]);
    setColorInput("");
  }

  function startFakeLoading(mode: "generate" | "edit") {
    const isUltra = quality === "ultra" && mode === "generate";
    let nextProgress = 0;
    const intervalRef = mode === "generate" ? generationInterval : editInterval;

    if (intervalRef.current) window.clearInterval(intervalRef.current);

    setProgress(0);
    setProgressText(isUltra ? "Ultra quality can take a little longer..." : mode === "edit" ? "Reviewing your current design..." : "Preparing your design...");

    intervalRef.current = window.setInterval(() => {
      if (isUltra) {
        if (nextProgress < 8) {
          nextProgress += 0.7;
          setProgressText("Preparing ultra quality render...");
        } else if (nextProgress < 20) {
          nextProgress += 0.5;
          setProgressText("Building detailed composition...");
        } else if (nextProgress < 40) {
          nextProgress += 0.35;
          setProgressText("Rendering enhanced details...");
        } else if (nextProgress < 60) {
          nextProgress += 0.22;
          setProgressText("Applying ultra quality refinements...");
        } else if (nextProgress < 78) {
          nextProgress += 0.12;
          setProgressText("Enhancing textures and print quality...");
        } else if (nextProgress < 88) {
          nextProgress += 0.06;
          setProgressText("Final ultra quality rendering...");
        } else if (nextProgress < 94) {
          nextProgress += 0.025;
          setProgressText("Almost finished...");
        }
      } else if (mode === "edit") {
        if (nextProgress < 25) {
          nextProgress += 2;
          setProgressText("Reviewing your current design...");
        } else if (nextProgress < 55) {
          nextProgress += 1.25;
          setProgressText("Applying requested changes...");
        } else if (nextProgress < 88) {
          nextProgress += 0.55;
          setProgressText("Generating updated version...");
        } else if (nextProgress < 95) {
          nextProgress += 0.2;
          setProgressText("Almost done...");
        }
      } else if (nextProgress < 15) {
        nextProgress += 2;
        setProgressText("Preparing your design...");
      } else if (nextProgress < 40) {
        nextProgress += 1.5;
        setProgressText("Getting your design ready...");
      } else if (nextProgress < 70) {
        nextProgress += 1;
        setProgressText("Creating your concept...");
      } else if (nextProgress < 90) {
        nextProgress += 0.5;
        setProgressText("Finalizing your design...");
      } else if (nextProgress < 95) {
        nextProgress += 0.2;
        setProgressText("Almost done...");
      }

      setProgress(Math.min(nextProgress, 95));
    }, 300);
  }

  function finishFakeLoading(mode: "generate" | "edit") {
    const intervalRef = mode === "generate" ? generationInterval : editInterval;

    if (intervalRef.current) window.clearInterval(intervalRef.current);

    setProgress(100);
    setProgressText(mode === "edit" ? "Update complete!" : "Design complete!");
    window.setTimeout(() => setProgress(0), 700);
  }

  async function runGeneration() {
    if (!selectedProduct) {
      alert("Please choose what you're creating first.");
      return;
    }

    if (!brandDetails.trim() && !businessCardDetails.trim()) {
      alert("Please add your design details first.");
      return;
    }

    if (quality === "ultra" && transparentBackground === "true") {
      alert("Ultra quality currently does not support transparent backgrounds.");
      return;
    }

    const token = await ensureAuthToken();

    if (!token) {
      alert("Sign in before creating a design.");
      return;
    }

    setIsGenerating(true);
    setResult(null);
    setResultImage("");
    startFakeLoading("generate");

    try {
      const response = await fetch(`${apiBase}/generate-design`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          productType: selectedProduct,
          quality,
          transparentBackground: transparentBackground === "true",
        }),
      });
      const data = (await response.json()) as GenerationResult;

      if (!response.ok) {
        throw new Error(data.error ?? "Generation failed");
      }

      const image = data.imageUrl ?? data.image ?? data.url ?? "";

      if (!image) {
        throw new Error("No image returned from backend");
      }

      setResult(data);
      setResultImage(image);
      finishFakeLoading("generate");
      downloadImage(image);
      await loadDesignCredits(token);
    } catch (error) {
      if (generationInterval.current) window.clearInterval(generationInterval.current);
      setProgressText(error instanceof Error ? error.message : "Something went wrong. Please try again.");
      setResult({ error: error instanceof Error ? error.message : "Generation failed." });
    } finally {
      setIsGenerating(false);
    }
  }

  async function runEdit() {
    if (!resultImage || !editRequest.trim()) {
      alert("Describe the changes you'd like first.");
      return;
    }

    const token = await ensureAuthToken();

    if (!token) {
      alert("Sign in before editing a design.");
      return;
    }

    setIsEditing(true);
    startFakeLoading("edit");

    try {
      const response = await fetch(resultImage);
      const imageBlob = await response.blob();
      const formData = new FormData();
      formData.append("image", imageBlob, "design.png");
      formData.append("editRequest", editRequest);

      const editResponse = await fetch(`${apiBase}/edit-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = (await editResponse.json()) as GenerationResult;

      if (!editResponse.ok) {
        throw new Error(data.error ?? "Edit failed");
      }

      const image = data.imageUrl ?? data.image ?? data.url ?? "";

      if (!image) throw new Error("No image returned from edit.");

      setResult(data);
      setResultImage(image);
      setEditRequest("");
      finishFakeLoading("edit");
      downloadImage(image);
      await loadDesignCredits(token);
    } catch (error) {
      if (editInterval.current) window.clearInterval(editInterval.current);
      setProgressText(error instanceof Error ? error.message : "Edit failed.");
    } finally {
      setIsEditing(false);
    }
  }

  function startVoice() {
    const Recognition = getSpeechRecognitionConstructor();

    if (!Recognition) {
      setVoiceSupported(false);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      let transcript = "";

      for (let index = 0; index < event.results.length; index += 1) {
        transcript += `${event.results[index][0].transcript} `;
      }

      setBrandDetails(transcript.trim());
    };
    recognition.onerror = () => setVoiceListening(false);
    recognition.onend = () => setVoiceListening(false);
    setVoiceListening(true);
    recognition.start();
  }

  function applyToProduct() {
    if (!resultImage) return;

    localStorage.setItem("prntd_generated_image", resultImage);
    localStorage.setItem(
      "prntd_design",
      JSON.stringify({
        image: resultImage,
        designId: result?.designId,
        designPath: result?.designPath,
        type: "generated-design",
      })
    );

    const product = selectedProduct.toLowerCase();

    if (product.includes("shirt") || product.includes("apparel")) {
      localStorage.setItem("prntd_product", "tshirt");
      window.location.href = "/designer";
      return;
    }

    if (product.includes("sticker")) {
      localStorage.setItem("prntd_product", "sticker");
    } else if (product.includes("business card")) {
      localStorage.setItem("prntd_product", "businesscard");
    } else if (product.includes("label")) {
      localStorage.setItem("prntd_product", "label");
    } else {
      localStorage.setItem("prntd_product", "product");
    }

    window.location.href = "/products";
  }

  const showBusinessCard = selectedProduct.toLowerCase().includes("business card");
  const hasProgress = isGenerating || isEditing || progress > 0;

 return (
  <main className="min-h-screen bg-[#020617] text-white">
    <ShopHeader />

    <section className="mx-auto w-full max-w-[1450px] px-5 py-[60px] pb-[110px]">
      <div className="mb-[52px] text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#cbd5e1]">
          AI Powered Creator Studio
        </div>

        <h1 className="mx-auto max-w-[950px] text-[clamp(48px,6vw,84px)] font-black leading-[0.96] tracking-[-0.05em]">
          Create Premium
          <span className="bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#c084fc_100%)] bg-clip-text text-transparent">
            {" "}
            Custom Designs
          </span>
        </h1>

        <p className="mx-auto mt-7 max-w-[820px] text-lg leading-[1.9] text-[#94a3b8]">
          Generate business cards, stickers, logos, apparel graphics,
          labels, posters, and creator assets with AI-powered commercial
          design tools.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/subscriptions"
            className="rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_22px_45px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5"
          >
            Buy Credits
          </Link>

          <Link
            href="/dashboard"
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/[0.08]"
          >
            Customer Portal
          </Link>

          <Link
            href="/my-designs"
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/[0.08]"
          >
            Saved Designs
          </Link>
        </div>

        <div className="mx-auto mt-[22px] grid max-w-xl gap-3">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-left backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
              Customer Account
            </p>

            <p className="mt-2 text-xl font-black text-white">
              {email || "Loading..."}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="rounded-full bg-[#312e81] px-4 py-2 text-sm font-black text-[#c7d2fe]">
                {credits}
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-[#cbd5e1]">
                1 Credit Per Generation
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-[28px] lg:grid-cols-[minmax(0,1fr)_430px] max-[1150px]:grid-cols-1">
        <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-[34px] shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
          <section className="mb-10">
            <h2 className="mb-3 text-3xl font-black">
              What are you creating?
            </h2>

            <p className="mb-6 text-[#94a3b8]">
              Select the type of product or asset you want to generate.
            </p>

            <div className="grid grid-cols-5 gap-4 max-[900px]:grid-cols-3 max-[640px]:grid-cols-2">
              {products.map((product) => (
                <button
                  key={product.value}
                  type="button"
                  onClick={() => selectProduct(product)}
                  className={`min-h-[95px] rounded-[26px] p-5 text-center text-[13px] font-black uppercase tracking-[0.12em] transition ${
                    selectedProduct === product.value
                      ? "bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] text-white shadow-[0_24px_50px_rgba(99,102,241,0.35)]"
                      : "border border-white/10 bg-white/[0.04] text-[#cbd5e1] hover:bg-white/[0.08]"
                  }`}
                >
                  {product.label}
                </button>
              ))}
            </div>
          </section>

          {!showBusinessCard && (
            <section className="mb-10">
              <h2 className="mb-3 text-3xl font-black">
                Describe Your Design
              </h2>

              <p className="mb-6 text-[#94a3b8]">
                Explain the vibe, colors, layout, typography, or concept.
              </p>

              <div className="relative">
                <textarea
                  value={brandDetails}
                  onChange={(event) =>
                    setBrandDetails(event.target.value)
                  }
                  className="min-h-[190px] w-full resize-y rounded-[26px] border border-white/10 bg-[#0f172a] p-6 pr-[78px] text-[15px] text-white outline-none transition focus:border-[#6366f1]/50 focus:bg-[#111827]"
                  placeholder="Example: Luxury streetwear design with chrome typography and futuristic cyberpunk details."
                />

                {voiceSupported && (
                  <button
                    type="button"
                    onClick={startVoice}
                    className={`absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black text-white shadow-[0_12px_25px_rgba(99,102,241,0.3)] ${
                      voiceListening
                        ? "bg-[linear-gradient(135deg,#ef4444,#dc2626)]"
                        : "bg-[linear-gradient(135deg,#3b82f6,#8b5cf6)]"
                    }`}
                  >
                    {voiceListening ? "●" : "Mic"}
                  </button>
                )}
              </div>
            </section>
          )}

          {showBusinessCard && (
            <section className="mb-10">
              <h2 className="mb-3 text-3xl font-black">
                Business Card Details
              </h2>

              <textarea
                value={businessCardDetails}
                onChange={(event) =>
                  setBusinessCardDetails(event.target.value)
                }
                className="min-h-[190px] w-full resize-y rounded-[26px] border border-white/10 bg-[#0f172a] p-6 text-[15px] text-white outline-none transition focus:border-[#6366f1]/50"
                placeholder={`Business Name:\nYour Name:\nPhone:\nEmail:\nWebsite:`}
              />
            </section>
          )}

          <section className="mb-10">
            <h2 className="mb-3 text-3xl font-black">
              Choose a Style
            </h2>

            <div className="flex flex-wrap gap-3">
              {styleOptions.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => toggleStyle(style)}
                  className={`rounded-full px-5 py-3 text-sm font-black capitalize transition ${
                    selectedStyles.includes(style)
                      ? "bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] text-white shadow-[0_14px_28px_rgba(99,102,241,0.25)]"
                      : "border border-white/10 bg-white/[0.04] text-[#cbd5e1] hover:bg-white/[0.08]"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  </main>
);
  modern: ["modern style"],
  photorealistic: [
    "photorealistic style",
  ],
  anime: ["anime style"],
  professional: [
    "professional style",
  ],
  urban: ["urban style"],
  futuristic: [
    "high-tech futuristic style",
  ],
  pencil: ["pencil style"],
};

const styleOptions = [
  "luxury",
  "minimal",
  "bold",
  "modern",
  "professional",
  "vintage",
  "retro",
  "urban",
  "streetwear",
  "anime",
  "cartoon",
  "futuristic",
  "cyberpunk",
  "pencil",
  "watercolor",
  "photorealistic",
  "text",
];

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined")
    return undefined;

  return (
    (
      window as unknown as {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      }
    ).SpeechRecognition ??
    (
      window as unknown as {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      }
    ).webkitSpeechRecognition
  );
}

function pickStyleText(style: string) {
  const source =
    styleTemplates[style] ?? [
      `${style} style`,
    ];

  return source[
    Math.floor(Math.random() * source.length)
  ];
}

function downloadImage(url: string) {
  fetch(url)
    .then((response) =>
      response.blob(),
    )
    .then((blob) => {
      const localUrl =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = localUrl;
      anchor.download = `design-${Date.now()}.png`;

      document.body.appendChild(anchor);

      anchor.click();

      anchor.remove();

      URL.revokeObjectURL(localUrl);
    });
}

export default function DesignGeneratorPage() {
  const {
    email,
    token: accountToken,
    status: accountStatus,
    loadAccount,
  } = usePrntdAccount();

  const [authToken, setAuthToken] =
    useState("");

  const [credits, setCredits] =
    useState("Credits: --");

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState("");

  const [
    selectedStyles,
    setSelectedStyles,
  ] = useState<string[]>([]);

  const [styleTexts, setStyleTexts] =
    useState<Record<string, string>>({});

  const [brandDetails, setBrandDetails] =
    useState("");

  const [
    businessCardDetails,
    setBusinessCardDetails,
  ] = useState("");

  const [industry, setIndustry] =
    useState("");

  const [quality, setQuality] =
    useState("standard");

  const [
    transparentBackground,
    setTransparentBackground,
  ] = useState("true");

  const [
    advancedOpen,
    setAdvancedOpen,
  ] = useState(false);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [isEditing, setIsEditing] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [progressText, setProgressText] =
    useState(
      "Preparing your design...",
    );

  const [result, setResult] =
    useState<GenerationResult | null>(
      null,
    );

  const [resultImage, setResultImage] =
    useState("");

  const [editRequest, setEditRequest] =
    useState("");

  const [
    voiceSupported,
    setVoiceSupported,
  ] = useState(() =>
    Boolean(
      getSpeechRecognitionConstructor(),
    ),
  );

  const [
    voiceListening,
    setVoiceListening,
  ] = useState(false);

  const generationInterval =
    useRef<number | null>(null);

  const editInterval =
    useRef<number | null>(null);

  const prompt = useMemo(() => {
    const parts: string[] = [];

    if (selectedProduct)
      parts.push(selectedProduct);

    const chosenStyles =
      selectedStyles
        .map((style) => styleTexts[style])
        .filter(Boolean);

    if (chosenStyles.length > 0) {
      parts.push(
        `with ${chosenStyles.join(", ")}`,
      );
    }

    if (industry.trim()) {
      parts.push(
        `for a ${industry.trim()}`,
      );
    }

    if (brandDetails.trim()) {
      parts.push(
        `details: ${brandDetails.trim()}`,
      );
    }

    if (
      businessCardDetails.trim()
    ) {
      parts.push(
        `business card details include: ${businessCardDetails.trim()}`,
      );
    }

    return parts.join(" ");
  }, [
    selectedProduct,
    selectedStyles,
    styleTexts,
    industry,
    brandDetails,
    businessCardDetails,
  ]);

  const showBusinessCard =
    selectedProduct
      .toLowerCase()
      .includes("business card");

  const hasProgress =
    isGenerating ||
    isEditing ||
    progress > 0;

  const generateButtonText =
    useMemo(() => {
      if (!selectedProduct) {
        return "Choose Product";
      }

      return "Generate Design";
    }, [selectedProduct]);

  const loadDesignCredits =
    useCallback(
      async (
        nextToken = authToken,
      ) => {
        if (!nextToken) {
          setCredits(
            "Credits: --",
          );

          return;
        }

        try {
          const response =
            await fetch(
              `${apiBase}/credits`,
              {
                headers: {
                  Authorization: `Bearer ${nextToken}`,
                },
              },
            );

          const data =
            (await response.json()) as {
              total_credits?: number;
              credits?: number;
              subscription_credits?: number;
            };

          const total =
            data.total_credits ??
            Number(
              data.credits ?? 0,
            ) +
              Number(
                data.subscription_credits ??
                  0,
              );

          setCredits(
            `Credits: ${total}`,
          );
        } catch {
          setCredits(
            "Credits: --",
          );
        }
      },
      [authToken],
    );

  useEffect(() => {
    if (!accountToken) return;

    const timer = window.setTimeout(() => {
      void loadDesignCredits(
        accountToken,
      );
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    accountToken,
    loadDesignCredits,
  ]);

  async function ensureAuthToken() {
    if (
      authToken ||
      accountToken
    ) {
      return (
        authToken ||
        accountToken
      );
    }

    const session =
      accountToken
        ? {
            token:
              accountToken,
          }
        : await loadAccount();

    if (!session?.token)
      return "";

    setAuthToken(
      session.token,
    );

    await loadDesignCredits(
      session.token,
    );

    return session.token;
  }

  function selectProduct(
    product: ProductChoice,
  ) {
    setSelectedProduct(
      product.value,
    );

    setSelectedStyles([]);

    setStyleTexts({});

    setIndustry("");

    setResult(null);

    setResultImage("");
  }

  function toggleStyle(
    style: string,
  ) {
    if (
      selectedStyles.includes(
        style,
      )
    ) {
      setSelectedStyles(
        (current) =>
          current.filter(
            (item) =>
              item !== style,
          ),
      );

      setStyleTexts(
        (current) => {
          const next = {
            ...current,
          };

          delete next[style];

          return next;
        },
      );

      return;
    }

    setSelectedStyles(
      (current) => [
        ...current,
        style,
      ],
    );

    setStyleTexts(
      (current) => ({
        ...current,
        [style]:
          pickStyleText(style),
      }),
    );
  }

  function startFakeLoading() {
    let nextProgress = 0;

    if (
      generationInterval.current
    ) {
      window.clearInterval(
        generationInterval.current,
      );
    }

    setProgress(0);

    generationInterval.current =
      window.setInterval(() => {
        if (nextProgress < 90) {
          nextProgress += 2;

          setProgress(
            nextProgress,
          );
        }
      }, 250);
  }

  function finishFakeLoading() {
    if (
      generationInterval.current
    ) {
      window.clearInterval(
        generationInterval.current,
      );
    }

    setProgress(100);

    window.setTimeout(() => {
      setProgress(0);
    }, 800);
  }

  async function runGeneration() {
    if (!selectedProduct)
      return;

    const token =
      await ensureAuthToken();

    if (!token) return;

    setIsGenerating(true);

    setResult(null);

    setResultImage("");

    startFakeLoading();

    try {
      const response =
        await fetch(
          `${apiBase}/generate-design`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              prompt,
              productType:
                selectedProduct,
              quality,
              transparentBackground:
                transparentBackground ===
                "true",
            }),
          },
        );

      const data =
        (await response.json()) as GenerationResult;

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Generation failed",
        );
      }

      const image =
        data.imageUrl ??
        data.image ??
        data.url ??
        "";

      setResult(data);

      setResultImage(image);

      finishFakeLoading();

      downloadImage(image);

      await loadDesignCredits(
        token,
      );
    } catch (error) {
      setResult({
        error:
          error instanceof Error
            ? error.message
            : "Generation failed",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function runEdit() {
    if (
      !resultImage ||
      !editRequest.trim()
    ) {
      return;
    }

    setIsEditing(true);

    try {
      const response =
        await fetch(resultImage);

      const imageBlob =
        await response.blob();

      const formData =
        new FormData();

      formData.append(
        "image",
        imageBlob,
        "design.png",
      );

      formData.append(
        "editRequest",
        editRequest,
      );

      const token =
        await ensureAuthToken();

      const editResponse =
        await fetch(
          `${apiBase}/edit-image`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          },
        );

      const data =
        (await editResponse.json()) as GenerationResult;

      const image =
        data.imageUrl ??
        data.image ??
        data.url ??
        "";

      setResult(data);

      setResultImage(image);

      setEditRequest("");

      downloadImage(image);
    } finally {
      setIsEditing(false);
    }
  }

  function startVoice() {
    const Recognition =
      getSpeechRecognitionConstructor();

    if (!Recognition) {
      setVoiceSupported(false);

      return;
    }

    const recognition =
      new Recognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = true;

    recognition.maxAlternatives = 1;

    recognition.onresult = (
      event,
    ) => {
      let transcript = "";

      for (
        let index = 0;
        index <
        event.results.length;
        index += 1
      ) {
        transcript += `${event.results[index][0].transcript} `;
      }

      setBrandDetails(
        transcript.trim(),
      );
    };

    recognition.onerror = () =>
      setVoiceListening(false);

    recognition.onend = () =>
      setVoiceListening(false);

    setVoiceListening(true);

    recognition.start();
  }

  function applyToProduct() {
    if (!resultImage) return;

    localStorage.setItem(
      "prntd_generated_image",
      resultImage,
    );

    window.location.href =
      "/products";
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[#4f46e5]/20 blur-[140px]" />

        <div className="absolute bottom-[-15%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[#2563eb]/20 blur-[160px]" />
      </div>

      <div className="relative z-10">
        <ShopHeader />

        <section className="mx-auto w-full max-w-[1700px] px-5 py-10 pb-24">
          {/* HERO */}
          <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#111827_40%,#312e81_100%)] p-8 shadow-[0_35px_120px_rgba(0,0,0,0.45)] sm:p-12">
            <div className="absolute right-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-[#8b5cf6]/20 blur-[140px]" />

            <div className="relative grid gap-10 xl:grid-cols-[1fr_380px]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#c7d2fe] backdrop-blur">
                  <Sparkles className="h-4 w-4" />
                  PRNTD Studio
                </div>

                <h1 className="mt-7 text-[clamp(56px,8vw,110px)] font-black leading-[0.9] tracking-[-0.06em]">
                  Generate
                  <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                    Premium Designs
                  </span>
                </h1>

                <p className="mt-8 max-w-3xl text-lg leading-9 text-[#cbd5e1]">
                  Create custom shirts,
                  logos, labels, stickers,
                  and business cards with
                  modern design tools.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/subscriptions"
                    className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] px-7 py-4 text-sm font-black text-white no-underline shadow-[0_15px_50px_rgba(99,102,241,0.35)] transition hover:-translate-y-1"
                  >
                    Buy Credits
                  </Link>

                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-4 text-sm font-black text-white no-underline transition hover:bg-white/[0.08]"
                  >
                    Open Dashboard
                  </Link>
                </div>
              </div>

              {/* ACCOUNT */}
              <div className="rounded-[32px] border border-white/10 bg-white/[0.05] p-7 backdrop-blur-2xl">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                  Creator Account
                </p>

                <p className="mt-4 break-all text-2xl font-black">
                  {email ||
                    "Loading..."}
                </p>

                <p className="mt-2 text-sm text-[#94a3b8]">
                  {accountStatus}
                </p>

                <div className="mt-8 rounded-[26px] border border-white/10 bg-[#0f172a]/80 p-6">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                    Credits
                  </p>

                  <p className="mt-4 text-[52px] font-black leading-none">
                    {credits.replace(
                      "Credits: ",
                      "",
                    )}
                  </p>

                  <p className="mt-3 text-sm leading-7 text-[#cbd5e1]">
                    Each generation
                    uses 1 credit.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN */}
          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
            {/* LEFT */}
            <div className="rounded-[36px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-2xl shadow-[0_25px_90px_rgba(0,0,0,0.35)]">
              {/* PRODUCTS */}
              <section>
                <div className="flex items-center gap-3">
                  <Layers3 className="h-6 w-6 text-[#818cf8]" />

                  <h2 className="text-3xl font-black tracking-[-0.04em]">
                    Product Type
                  </h2>
                </div>

                <div className="mt-7 grid grid-cols-5 gap-4 max-[1000px]:grid-cols-3 max-[700px]:grid-cols-2">
                  {products.map(
                    (product) => (
                      <button
                        key={
                          product.value
                        }
                        type="button"
                        onClick={() =>
                          selectProduct(
                            product,
                          )
                        }
                        className={`rounded-[28px] border p-5 text-left transition duration-300 hover:-translate-y-1 ${
                          selectedProduct ===
                          product.value
                            ? "border-[#6366f1]/40 bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] text-white shadow-[0_20px_60px_rgba(99,102,241,0.35)]"
                            : "border-white/10 bg-white/[0.04] text-white hover:border-[#6366f1]/20 hover:bg-white/[0.06]"
                        }`}
                      >
                        <p className="text-lg font-black">
                          {
                            product.label
                          }
                        </p>

                        <p className="mt-3 text-xs leading-6 opacity-80">
                          
                          premium
                          graphics.
                        </p>
                      </button>
                    ),
                  )}
                </div>
              </section>

              {/* DESCRIPTION */}
              <section className="mt-10">
                <h2 className="text-3xl font-black tracking-[-0.04em]">
                  Describe Your
                  Design
                </h2>

                <div className="relative mt-6">
                  <textarea
                    value={
                      showBusinessCard
                        ? businessCardDetails
                        : brandDetails
                    }
                    onChange={(
                      event,
                    ) =>
                      showBusinessCard
                        ? setBusinessCardDetails(
                            event
                              .target
                              .value,
                          )
                        : setBrandDetails(
                            event
                              .target
                              .value,
                          )
                    }
                    className="min-h-[240px] w-full resize-y rounded-[30px] border border-white/10 bg-[#0f172a]/90 p-7 pr-24 text-[16px] leading-8 text-white outline-none transition focus:border-[#6366f1]/40"
                    placeholder="Describe your vision, typography, colors, style, mood..."
                  />

                  {voiceSupported && (
                    <button
                      type="button"
                      onClick={
                        startVoice
                      }
                      className={`absolute bottom-5 right-5 flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-black text-white shadow-[0_15px_50px_rgba(99,102,241,0.35)] ${
                        voiceListening
                          ? "bg-[linear-gradient(135deg,#ef4444,#dc2626)]"
                          : "bg-[linear-gradient(135deg,#3b82f6,#8b5cf6)]"
                      }`}
                    >
                      <Mic className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </section>

              {/* STYLES */}
              <section className="mt-10">
                <h2 className="text-3xl font-black tracking-[-0.04em]">
                  Style Presets
                </h2>

                <div className="mt-7 flex flex-wrap gap-3">
                  {styleOptions.map(
                    (style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() =>
                          toggleStyle(
                            style,
                          )
                        }
                        className={`rounded-full px-5 py-3 text-sm font-black capitalize transition ${
                          selectedStyles.includes(
                            style,
                          )
                            ? "bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] text-white shadow-[0_10px_30px_rgba(99,102,241,0.28)]"
                            : "border border-white/10 bg-white/[0.04] text-[#cbd5e1] hover:bg-white/[0.08]"
                        }`}
                      >
                        {style}
                      </button>
                    ),
                  )}
                </div>
              </section>

              {/* FINAL */}
              <section className="mt-10">
                <h2 className="text-3xl font-black tracking-[-0.04em]">
                  Final Prompt
                </h2>

                <textarea
                  value={prompt}
                  readOnly
                  className="mt-5 min-h-[160px] w-full rounded-[28px] border border-white/10 bg-[#0f172a]/80 p-6 text-[15px] leading-8 text-[#cbd5e1]"
                />
              </section>

              {/* CTA */}
              <button
                type="button"
                onClick={
                  runGeneration
                }
                disabled={
                  isGenerating
                }
                className="mt-10 flex w-full items-center justify-center gap-3 rounded-[28px] bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] px-8 py-6 text-xl font-black text-white shadow-[0_20px_60px_rgba(99,102,241,0.35)] transition hover:-translate-y-1 disabled:opacity-50"
              >
                <Wand2 className="h-6 w-6" />

                {isGenerating
                  ? "Generating..."
                  : generateButtonText}
              </button>

              {hasProgress && (
                <div className="mt-7">
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] transition-all"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  <p className="mt-4 text-center text-sm text-[#cbd5e1]">
                    {
                      progressText
                    }
                  </p>
                </div>
              )}
            </div>

            {/* PREVIEW */}
            <aside className="sticky top-5 h-fit overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,#111827_0%,#1e1b4b_100%)] p-7 shadow-[0_35px_120px_rgba(0,0,0,0.45)]">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#c7d2fe]">
                Image Render Preview
              </p>

              <h2 className="mt-4 text-[46px] font-black leading-[0.95] tracking-[-0.04em]">
                Live
                <span className="block text-[#a5b4fc]">
                  Preview
                </span>
              </h2>

              <div className="mt-7 overflow-hidden rounded-[32px] border border-white/10 bg-[#0f172a]/90 p-5">
                {!resultImage &&
                  !result?.error && (
                    <div className="grid min-h-[520px] place-items-center text-center">
                      <div>
                        <h3 className="text-2xl font-black">
                          Waiting For
                          Design
                        </h3>

                        <p className="mt-4 text-sm leading-7 text-[#94a3b8]">
                          Your generated
                          artwork preview
                          will appear
                          here.
                        </p>
                      </div>
                    </div>
                  )}

                {result?.error && (
                  <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-6 text-center text-red-300">
                    {
                      result.error
                    }
                  </div>
                )}

                {resultImage && (
                  <div>
                    <img
                      src={
                        resultImage
                      }
                      alt="Generated design"
                      className="w-full rounded-[24px] shadow-[0_20px_80px_rgba(0,0,0,0.35)]"
                    />

                    <div className="mt-7 border-t border-white/10 pt-7">
                      <textarea
                        value={
                          editRequest
                        }
                        onChange={(
                          event,
                        ) =>
                          setEditRequest(
                            event
                              .target
                              .value,
                          )
                        }
                        className="min-h-[140px] w-full rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-white"
                        placeholder="Describe changes..."
                      />

                      <button
                        type="button"
                        onClick={
                          runEdit
                        }
                        disabled={
                          isEditing
                        }
                        className="mt-5 flex w-full items-center justify-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.06] px-6 py-5 text-sm font-black text-white transition hover:bg-white/[0.1]"
                      >
                        <RefreshCw className="h-4 w-4" />

                        {isEditing
                          ? "Updating..."
                          : "Update Design"}
                      </button>
                    </div>

                    <div className="mt-5 grid gap-3">
                      <button
                        type="button"
                        onClick={
                          applyToProduct
                        }
                        className="flex items-center justify-center gap-3 rounded-[22px] bg-white px-6 py-5 text-sm font-black text-[#111827] transition hover:scale-[1.01]"
                      >
                        <ArrowRight className="h-4 w-4" />
                        Apply To
                        Product
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          downloadImage(
                            resultImage,
                          )
                        }
                        className="flex items-center justify-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] px-6 py-5 text-sm font-black text-white transition hover:bg-white/[0.08]"
                      >
                        <Download className="h-4 w-4" />
                        Download
                        Design
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
