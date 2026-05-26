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
  vintage: ["retro vintage style"],
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
] = useState(
  typeof window !== "undefined" &&
    !!navigator.mediaDevices,
);

const [
  voiceListening,
  setVoiceListening,
] = useState(false);

const [
  liveTranscript,
  setLiveTranscript,
] = useState("");

const mediaRecorderRef =
  useRef<MediaRecorder | null>(null);

const mediaStreamRef =
  useRef<MediaStream | null>(null);

const audioChunksRef =
  useRef<Blob[]>([]);

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

  async function startVoice() {
  if (voiceListening) {
    mediaRecorderRef.current?.stop();

    mediaStreamRef.current
      ?.getTracks()
      .forEach((track) =>
        track.stop(),
      );

    setVoiceListening(false);

    return;
  }

  try {
    const token =
      await ensureAuthToken();

    if (!token) return;

    const stream =
      await navigator.mediaDevices.getUserMedia(
        {
          audio: {
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
  channelCount: 1,
  
}
        },
      );

    mediaStreamRef.current =
      stream;

   const mediaRecorder =
  new MediaRecorder(stream, {
    mimeType:
      "audio/webm;codecs=opus",
    audioBitsPerSecond: 256000,
  });

    mediaRecorderRef.current =
      mediaRecorder;

    audioChunksRef.current = [];

    mediaRecorder.ondataavailable =
      (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(
            event.data,
          );
        }
      };

    mediaRecorder.onstop =
      async () => {
        try {

await new Promise(
  (resolve) =>
    setTimeout(resolve, 150),
);
          const audioBlob =
            new Blob(
              audioChunksRef.current,
              {
                type: "audio/webm",
              },
            );

          const formData =
            new FormData();

          formData.append(
            "audio",
            audioBlob,
            "voice.webm",
          );

          const response =
            await fetch(
              `${apiBase}/transcribe`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: formData,
              },
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.error ??
                "Voice transcription failed",
            );
          }

          const transcript =
            data.text?.trim() ??
            "";


          if (!transcript)
            return;

          if (
            showBusinessCard
          ) {
            setBusinessCardDetails(
              (
                previous,
              ) =>
                [
                  previous,
                  transcript,
                ]
                  .filter(Boolean)
                  .join(" ")
                  .trim(),
            );
          } else {
            setBrandDetails(
  transcript,
);
          }
        } catch (error) {
          console.error(
            "Voice transcription failed:",
            error,
          );
        } finally {
          mediaStreamRef.current
            ?.getTracks()
            .forEach((track) =>
              track.stop(),
            );

          mediaStreamRef.current =
            null;

          mediaRecorderRef.current =
            null;

          audioChunksRef.current =
            [];

          setVoiceListening(
            false,
          );
        }
      };

    mediaRecorder.start(250);

setVoiceListening(true);

setLiveTranscript("");

const audioContext =
  new AudioContext();

const source =
  audioContext.createMediaStreamSource(
    stream,
  );

const analyser =
  audioContext.createAnalyser();

source.connect(analyser);

const dataArray =
  new Uint8Array(
    analyser.fftSize,
  );

let silenceStart =
  Date.now();

const silenceDelay = 800;

let dynamicThreshold = 0;

let calibrationTotal = 0;
let calibrationFrames = 0;

const calibrationDuration = 1000;

const calibrationStart =
  Date.now();

function calibrateNoise() {
  analyser.getByteTimeDomainData(
    dataArray,
  );

  let volume = 0;

  for (
    let i = 0;
    i < dataArray.length;
    i++
  ) {
    volume += Math.abs(
      dataArray[i] - 128,
    );
  }

  volume =
    volume /
    dataArray.length;

  calibrationTotal += volume;

  calibrationFrames++;

  if (
    Date.now() -
      calibrationStart <
    calibrationDuration
  ) {
    requestAnimationFrame(
      calibrateNoise,
    );

    return;
  }

  const ambientNoise =
    calibrationTotal /
    calibrationFrames;

  dynamicThreshold =
    Math.max(
      ambientNoise + 4,
      4,
    );

  console.log(
    "Ambient:",
    ambientNoise,
  );

  console.log(
    "Threshold:",
    dynamicThreshold,
  );

  checkSilence();
}

function checkSilence() {  if (
    mediaRecorder.state !==
    "recording"
  ) {
    audioContext.close();

    return;
  }

  analyser.getByteTimeDomainData(
    dataArray,
  );

  let volume = 0;

  for (
    let i = 0;
    i < dataArray.length;
    i++
  ) {
    volume += Math.abs(
      dataArray[i] - 128,
    );
  }

  volume =
    volume /
    dataArray.length;
console.log(volume);


  if (
    volume >
    dynamicThreshold
  ) {
    silenceStart =
      Date.now();
  }

  
if (
  Date.now() -
    silenceStart >
  silenceDelay
) {
  mediaRecorder.stop();

  audioContext.close();

  return;
}


  requestAnimationFrame(
    checkSilence,
  );
}

calibrateNoise();
  } catch (error) {
    console.error(
      "Microphone failed:",
      error,

    );

    setVoiceListening(false);
  }
}

  function applyToProduct() {
    if (!resultImage) return;

    const storedDesign = {
      image: resultImage,
      designId:
        result?.designId ?? null,
      designPath:
        result?.designPath ?? "",
      type: selectedProduct,
    };

    localStorage.setItem(
      "prntd_design",
      JSON.stringify(storedDesign),
    );

    localStorage.setItem(
      "prntd_generated_image",
      resultImage,
    );

    const normalizedProduct =
      selectedProduct.toLowerCase();

    if (
      normalizedProduct.includes(
        "sticker",
      )
    ) {
      window.location.href =
        "/products/die-cut-stickers";
      return;
    }

    if (
      normalizedProduct.includes(
        "business card",
      )
    ) {
      window.location.href =
        "/products/business-cards";
      return;
    }

    if (
      normalizedProduct.includes(
        "apparel",
      ) ||
      normalizedProduct.includes(
        "shirt",
      )
    ) {
      window.location.href =
        "/products/classic-tee";
      return;
    }

    window.location.href = "/products";
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
                  PRNTD AI Studio
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
                  design creation tools.
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
                          Print-ready
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

              {/* SETTINGS */}
              <section className="mt-10 rounded-[30px] border border-white/10 bg-[#0f172a]/70 p-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="grid gap-3">
                    <span className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                      Design Quality
                    </span>

                    <select
                      value={quality}
                      onChange={(
                        event,
                      ) =>
                        setQuality(
                          event.target
                            .value,
                        )
                      }
                      className="h-[58px] rounded-2xl border border-white/10 bg-[#020617] px-5 text-white outline-none transition focus:border-[#6366f1]/40"
                    >
                      <option value="basic">
                        Fastest Speed - Basic Quality - 25 sec
                      </option>

                      <option value="standard">
                        Medium Speed - High Quality - 40 sec
                      </option>

                      <option value="premium">
                        Medium Speed - Best Quality - 1 min
                      </option>

                      <option value="ultra">
                        Slowest Speed - Ultra Quality - 3 min
                      </option>
                    </select>
                  </label>

                  <div className="grid gap-3">
                    <span className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                      Transparent Background
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ["true", "On"],
                        ["false", "Off"],
                      ].map(
                        ([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              setTransparentBackground(
                                value,
                              )
                            }
                            className={`h-[58px] rounded-2xl border px-5 text-sm font-black transition ${
                              transparentBackground ===
                              value
                                ? "border-[#6366f1]/40 bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] text-white shadow-[0_12px_34px_rgba(99,102,241,0.28)]"
                                : "border-white/10 bg-white/[0.04] text-[#cbd5e1] hover:bg-white/[0.08]"
                            }`}
                          >
                            {label}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setAdvancedOpen(
                      (open) =>
                        !open,
                    )
                  }
                  className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-black text-[#c7d2fe] transition hover:bg-white/[0.08]"
                >
                  {advancedOpen
                    ? "Hide Options"
                    : "+ More Options"}
                </button>

                {advancedOpen && (
                  <div className="mt-5 grid gap-3">
                    <label className="grid gap-3">
                      <span className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                        Industry
                      </span>

                      <input
                        value={industry}
                        onChange={(
                          event,
                        ) =>
                          setIndustry(
                            event.target
                              .value,
                          )
                        }
                        placeholder="Example: Barber Shop, Clothing Brand"
                        className="h-[58px] rounded-2xl border border-white/10 bg-[#020617] px-5 text-white outline-none transition placeholder:text-[#64748b] focus:border-[#6366f1]/40"
                      />
                    </label>
                  </div>
                )}
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
