"use client";

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

    <section className="mx-auto w-full max-w-[1500px] px-5 py-[55px] pb-[100px]">
      <div className="mb-[50px] text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#cbd5e1]">
          AI Powered Design Creator
        </div>

        <h1 className="mx-auto max-w-[950px] text-[clamp(48px,6vw,88px)] font-black leading-[0.95] tracking-[-0.04em]">
          Create Professional
          <span className="bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#c084fc_100%)] bg-clip-text text-transparent">
            {" "}
            Custom Designs
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-[820px] text-lg leading-[1.9] text-[#94a3b8]">
          Generate shirts, business cards, stickers, labels, logos,
          posters, banners, and more with AI-assisted commercial design tools.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/subscriptions"
            className="rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_20px_40px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5"
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

        <div className="mx-auto mt-8 grid max-w-xl gap-3">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-left backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
              Customer Account
            </p>

            <p className="mt-2 text-xl font-black text-white">
              {email || "Loading..."}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
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
              Select the product or asset type you want to generate.
            </p>

            <div className="grid grid-cols-5 gap-4 max-[900px]:grid-cols-3 max-[640px]:grid-cols-2">
              {products.map((product) => (
                <button
                  key={product.value}
                  type="button"
                  onClick={() => selectProduct(product)}
                  className={`min-h-[95px] rounded-[26px] p-5 text-center text-[13px] font-black uppercase tracking-[0.12em] transition ${
                    selectedProduct === product.value
                      ? "bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] text-white shadow-[0_25px_50px_rgba(99,102,241,0.35)]"
                      : "border border-white/10 bg-white/[0.04] text-[#cbd5e1] hover:bg-white/[0.08]"
                  }`}
                >
                  {product.label}
                </button>
              ))}
            </div>
          </section>