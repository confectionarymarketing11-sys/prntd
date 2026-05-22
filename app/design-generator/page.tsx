"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import ShopHeader from "@/components/ShopHeader";

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

function getSavedEmail() {
  if (typeof window === "undefined") return "";

  return localStorage.getItem("prntd_customer_email") ?? localStorage.getItem("prntd_email") ?? "";
}

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
  const [email, setEmail] = useState(getSavedEmail);
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

  async function loadAuthToken(nextEmail = email) {
    if (!nextEmail.trim()) return "";

    const response = await fetch(`${apiBase}/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: nextEmail.trim() }),
    });

    if (!response.ok) {
      setCredits("Credits: --");
      return "";
    }

    const data = (await response.json()) as { token?: string };

    if (!data.token) return "";

    localStorage.setItem("prntd_customer_email", nextEmail.trim());
    setAuthToken(data.token);

    return data.token;
  }

  async function loadDesignCredits(nextToken = authToken) {
    if (!nextToken) {
      setCredits(email.trim() ? "Credits: --" : "Enter email to load credits");
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
  }

  async function connectAccount() {
    const token = await loadAuthToken(email);
    await loadDesignCredits(token);
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

    let token = authToken;

    if (!token) {
      token = await loadAuthToken(email);
    }

    if (!token) {
      alert("Enter your account email before creating a design.");
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

    let token = authToken;

    if (!token) {
      token = await loadAuthToken(email);
    }

    if (!token) {
      alert("Enter your account email before editing a design.");
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
    <main className="min-h-screen bg-[#f4f7fb] text-[#111827]">
      <ShopHeader />

      <section className="mx-auto w-full max-w-[1400px] px-5 py-[55px] pb-[90px]">
        <div className="mb-[42px] text-center">
          <h1 className="mb-[18px] text-[clamp(42px,5vw,70px)] font-extrabold leading-[1.02] tracking-normal text-[#111827]">
            Create Custom Designs
          </h1>
          <p className="mx-auto max-w-[760px] text-lg leading-[1.75] text-[#6b7280]">
            Design shirts, logos, stickers, labels, and more with a professional custom design creator built for real products.
          </p>

          <div className="mt-[30px] flex flex-wrap justify-center gap-3.5">
            <Link href="/products" className="design-top-btn">
              Buy Credits
            </Link>
            <Link href="/dashboard" className="design-top-btn">
              Open Customer Portal
            </Link>
            <Link href="/my-designs" className="design-top-btn">
              Saved Designs
            </Link>
          </div>

          <div className="mx-auto mt-[18px] grid max-w-xl gap-3 text-sm text-[#6b7280]">
            <p>{credits}</p>
            <p>Each design creation uses 1 credit</p>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Account email for credits"
                className="h-12 rounded-full border border-[#e5e7eb] bg-white px-5 text-sm text-[#111827] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
              <button type="button" onClick={connectAccount} className="design-top-btn !py-3">
                Load Credits
              </button>
            </div>
          </div>
        </div>

        <div className="grid items-start gap-[26px] lg:grid-cols-[minmax(0,1fr)_400px] max-[1100px]:grid-cols-1">
          <div className="rounded-[28px] border border-white/50 bg-white/90 p-[30px] shadow-[0_12px_38px_rgba(0,0,0,0.06)] backdrop-blur max-[640px]:p-[22px]">
            <section className="mb-8">
              <h2 className="mb-2.5 text-2xl font-extrabold">What are you creating?</h2>
              <p className="mb-[18px] text-sm leading-7 text-[#6b7280]">Select the type of product or design you want to create.</p>
              <div className="grid grid-cols-5 gap-3.5 max-[900px]:grid-cols-3 max-[640px]:grid-cols-2">
                {products.map((product) => (
                  <button
                    key={product.value}
                    type="button"
                    onClick={() => selectProduct(product)}
                    className={`min-h-[84px] rounded-[22px] p-4 text-center text-[13px] font-bold transition hover:-translate-y-0.5 ${
                      selectedProduct === product.value
                        ? "bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#7c3aed_100%)] text-white shadow-[0_14px_30px_rgba(99,102,241,0.24)]"
                        : "bg-[linear-gradient(135deg,#eef4ff_0%,#eef2ff_45%,#f5f3ff_100%)] text-[#374151] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.08)] hover:shadow-[0_12px_26px_rgba(99,102,241,0.14)]"
                    }`}
                  >
                    {product.label}
                  </button>
                ))}
              </div>
            </section>

            {!showBusinessCard && (
              <section className="mb-8">
                <h2 className="mb-2.5 text-2xl font-extrabold">Describe Your Design</h2>
                <p className="mb-[18px] text-sm leading-7 text-[#6b7280]">Explain your idea, theme, text, colors, layout, or vibe.</p>
                <div className="relative">
                  <textarea
                    value={brandDetails}
                    onChange={(event) => setBrandDetails(event.target.value)}
                    className="min-h-[170px] w-full resize-y rounded-[20px] border border-[#e5e7eb] bg-white p-[17px] pr-[70px] text-[15px] outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="Example: Modern retro mountain shirt design with vintage sunset colors and bold typography."
                  />
                  {voiceSupported && (
                    <button
                      type="button"
                      onClick={startVoice}
                      className={`absolute bottom-3.5 right-3.5 flex h-11 w-11 items-center justify-center rounded-[14px] text-lg font-bold text-white shadow-[0_8px_20px_rgba(99,102,241,0.22)] ${
                        voiceListening
                          ? "bg-[linear-gradient(135deg,#ef4444,#dc2626)]"
                          : "bg-[linear-gradient(135deg,#3b82f6,#7c3aed)]"
                      }`}
                    >
                      {voiceListening ? "●" : "Mic"}
                    </button>
                  )}
                </div>
                <div className="mt-3 flex justify-end">
                  <button type="button" onClick={() => setBrandDetails("")} className="design-utility-btn">
                    Clear Description
                  </button>
                </div>
                {voiceListening && <p className="mt-2.5 text-[13px] text-[#6b7280]">Listening...</p>}
              </section>
            )}

            {showBusinessCard && (
              <section className="mb-8">
                <h2 className="mb-2.5 text-2xl font-extrabold">Business Card Details</h2>
                <p className="mb-[18px] text-sm leading-7 text-[#6b7280]">
                  Add your business details and describe how you want the card designed.
                </p>
                <textarea
                  value={businessCardDetails}
                  onChange={(event) => setBusinessCardDetails(event.target.value)}
                  className="min-h-[170px] w-full resize-y rounded-[20px] border border-[#e5e7eb] bg-white p-[17px] text-[15px] outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  placeholder={`Business Name:\nYour Name:\nPhone:\nEmail:\nWebsite:`}
                />
              </section>
            )}

            <section className="mb-8">
              <h2 className="mb-2.5 text-2xl font-extrabold">Choose a Style</h2>
              <p className="mb-[18px] text-sm leading-7 text-[#6b7280]">Pick one or multiple styles.</p>
              <div className="flex flex-wrap gap-3">
                {styleOptions.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleStyle(style)}
                    className={`rounded-full px-[18px] py-3 text-sm font-bold capitalize transition hover:-translate-y-px ${
                      selectedStyles.includes(style)
                        ? "bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#7c3aed_100%)] text-white shadow-[0_10px_22px_rgba(99,102,241,0.22)]"
                        : "bg-[linear-gradient(135deg,#eef4ff_0%,#eef2ff_45%,#f5f3ff_100%)] text-[#374151] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.08)] hover:shadow-[0_10px_22px_rgba(99,102,241,0.14)]"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </section>

            <section className="mb-8 grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-2.5 text-2xl font-extrabold">Design Quality</h2>
                <select
                  value={quality}
                  onChange={(event) => {
                    const nextQuality = event.target.value;

                    setQuality(nextQuality);
                    setTransparentBackground(nextQuality === "ultra" ? "false" : "true");
                  }}
                  className="h-[58px] w-full rounded-[20px] border border-[#e5e7eb] bg-white px-[17px] text-[15px] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                >
                  <option value="basic">Fastest Speed - Basic Quality - (25secs)</option>
                  <option value="standard">Medium Speed - High Quality - (40secs)</option>
                  <option value="premium">Medium Speed - Best Quality - (1 min)</option>
                  <option value="ultra">Slowest Speed - Ultra Quality - (3 mins)</option>
                </select>
              </div>
              <div>
                <h2 className="mb-2.5 text-2xl font-extrabold">Toggle Transparent Background</h2>
                <select
                  value={transparentBackground}
                  disabled={quality === "ultra"}
                  onChange={(event) => setTransparentBackground(event.target.value)}
                  className="h-[58px] w-full rounded-[20px] border border-[#e5e7eb] bg-white px-[17px] text-[15px] outline-none disabled:opacity-60 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                >
                  <option value="false">Off</option>
                  <option value="true">On</option>
                </select>
              </div>
            </section>

            <section className="mb-8">
              <button type="button" onClick={() => setAdvancedOpen((current) => !current)} className="font-bold text-[#6366f1]">
                {advancedOpen ? "- Less Options" : "+ More Options"}
              </button>

              {advancedOpen && (
                <div className="mt-6 grid gap-8">
                  <div>
                    <h2 className="mb-2.5 text-2xl font-extrabold">Industry</h2>
                    <input
                      value={industry}
                      onChange={(event) => setIndustry(event.target.value)}
                      className="h-[58px] w-full rounded-[20px] border border-[#e5e7eb] bg-white px-[17px] text-[15px] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      placeholder="Example: Barber Shop, Clothing Brand"
                    />
                  </div>
                  <div>
                    <h2 className="mb-2.5 text-2xl font-extrabold">Preferred Colors</h2>
                    <input
                      value={colorInput}
                      onChange={(event) => setColorInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addColorValue();
                        }
                      }}
                      onBlur={() => addColorValue()}
                      className="h-[58px] w-full rounded-[20px] border border-[#e5e7eb] bg-white px-[17px] text-[15px] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      placeholder="Example: Black and Gold"
                    />
                    <div className="mt-3.5 flex flex-wrap gap-2.5">
                      {colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setColors((current) => current.filter((item) => item !== color))}
                          className="rounded-full bg-[linear-gradient(135deg,#eef4ff_0%,#eef2ff_45%,#f5f3ff_100%)] px-3.5 py-2 text-[13px] font-bold text-[#4338ca]"
                        >
                          {color} x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="mb-8">
              <h2 className="mb-2.5 text-2xl font-extrabold">Final Design Request</h2>
              <textarea
                value={prompt}
                readOnly
                className="min-h-[120px] w-full resize-y rounded-[20px] border border-[#e5e7eb] bg-white p-[17px] text-[15px] outline-none"
                placeholder="Your final design request builds automatically here."
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct("");
                    setSelectedStyles([]);
                    setStyleTexts({});
                    setBrandDetails("");
                    setBusinessCardDetails("");
                    setIndustry("");
                    setColors([]);
                    setResult(null);
                    setResultImage("");
                  }}
                  className="design-utility-btn"
                >
                  Clear Final Design
                </button>
              </div>
            </section>

            <button type="button" onClick={runGeneration} disabled={isGenerating} className="design-main-btn">
              {isGenerating ? "Creating..." : generateButtonText}
            </button>

            {hasProgress && (
              <div className="mt-6">
                <div className="h-3 w-full overflow-hidden rounded-full bg-[#e5e7eb]">
                  <div
                    className="h-full bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#7c3aed_100%)] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-3 text-center text-sm text-[#6b7280]">{progressText}</p>
              </div>
            )}
          </div>

          <aside className="sticky top-5 rounded-[28px] border border-white/50 bg-white/90 p-[30px] shadow-[0_12px_38px_rgba(0,0,0,0.06)] backdrop-blur max-[1100px]:relative max-[1100px]:top-auto max-[640px]:p-[22px]">
            <h2 className="mb-2.5 text-2xl font-extrabold">Design Preview</h2>
            <div className="min-h-[500px] rounded-3xl border border-[#e5e7eb] bg-[#f9fafb] p-5">
              {!resultImage && !result?.error && (
                <div className="pt-[100px] text-center">
                  <h3 className="mb-3 font-extrabold text-[#111827]">Your Design Preview</h3>
                  <p className="text-[#6b7280]">Your generated design will appear here after creation.</p>
                </div>
              )}

              {result?.error && (
                <div className="rounded-[14px] border border-[#eeeeee] bg-white p-5 text-center">
                  <p className="text-base text-[#111827]">{result.error}</p>
                  {result.error.toLowerCase().includes("credit") && (
                    <Link href="/products" className="mt-4 inline-flex font-bold text-[#3498db]">
                      Buy More Credits
                    </Link>
                  )}
                </div>
              )}

              {resultImage && (
                <div className="text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resultImage}
                    alt="Generated design"
                    className="w-full max-w-full rounded-[22px] bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%),linear-gradient(-45deg,#e5e7eb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e7eb_75%),linear-gradient(-45deg,transparent_75%,#e5e7eb_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0px] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
                  />
                  <p className="mt-[18px] text-center text-sm leading-7 text-[#6b7280]">
                    Download finishes automatically. Check your downloads folder after generation.
                  </p>

                  <div className="mt-[26px] border-t border-[#e5e7eb] pt-[22px]">
                    <textarea
                      value={editRequest}
                      onChange={(event) => setEditRequest(event.target.value)}
                      className="min-h-[120px] w-full rounded-[22px] border border-[#e5e7eb] bg-white p-[18px] text-[15px] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      placeholder="Describe the changes you'd like..."
                    />
                    <button type="button" onClick={runEdit} disabled={isEditing} className="design-main-btn">
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
                    className="design-main-btn"
                  >
                    New Design
                  </button>
                  <button type="button" onClick={applyToProduct} className="design-main-btn">
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
}
