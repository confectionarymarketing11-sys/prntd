/* eslint-disable */
// @ts-nocheck
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import jwt from "jsonwebtoken";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY =
  process.env.OPENAI_API_KEY!;
const JWT_SECRET =
  process.env.JWT_SECRET!;
const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN || "";
const OPENAI_IMAGE_TIMEOUT_MS =
  Number(process.env.OPENAI_IMAGE_TIMEOUT_MS || 90000);
const OPENAI_MAX_RETRIES =
  Number(process.env.OPENAI_MAX_RETRIES || 1);

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  timeout: Number.isFinite(OPENAI_IMAGE_TIMEOUT_MS)
    ? OPENAI_IMAGE_TIMEOUT_MS
    : 90000,
  maxRetries: Number.isFinite(OPENAI_MAX_RETRIES)
    ? OPENAI_MAX_RETRIES
    : 1,
});

function safeError(error: any) {
  return {
    name: error?.name,
    message: error?.message,
    status: error?.status,
    code: error?.code,
    type: error?.type,
  };
}

function createGenerateLogger() {
  const requestId =
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const start = Date.now();
  let last = start;

  return {
    requestId,
    mark(stage: string, details: Record<string, any> = {}) {
      const now = Date.now();

      console.log(
        JSON.stringify({
          scope: "prntd.generate-design",
          requestId,
          stage,
          elapsedMs: now - start,
          stepMs: now - last,
          ...details,
        })
      );

      last = now;
    },
    error(stage: string, error: any, details: Record<string, any> = {}) {
      const now = Date.now();

      console.error(
        JSON.stringify({
          scope: "prntd.generate-design",
          requestId,
          stage,
          elapsedMs: now - start,
          stepMs: now - last,
          error: safeError(error),
          ...details,
        })
      );

      last = now;
    },
  };
}

/*
========================
CORS
========================
*/

function corsHeaders(origin?: string) {
  return {
    "Access-Control-Allow-Origin":
      origin || ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization",
    "Access-Control-Allow-Methods":
      "POST, OPTIONS",
    "Access-Control-Allow-Credentials":
      "true",
  };
}

function jsonResponse(
  body: Record<string, any>,
  status: number,
  origin?: string
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders(origin),
        "Content-Type":
          "application/json",
      },
    }
  );
}

/*
========================
OPTIONS / PREFLIGHT
========================
*/

export async function loader({
  request,
}: any) {
  const origin =
    request.headers.get("origin") ||
    ALLOWED_ORIGIN;

  return new Response(null, {
    status: 200,
    headers: corsHeaders(origin),
  });
}

/*
========================
AUTO CLEANUP
========================
*/

async function cleanupRateLimits(
  supabase: any
) {
  if (Math.random() < 0.05) {
    const cutoff = new Date(
      Date.now() - 60000
    ).toISOString();

    await supabase
      .from("rate_limits")
      .delete()
      .lt("created_at", cutoff);
  }
}

/*
========================
RATE LIMIT
========================
*/

async function isRateLimitedDB(
  supabase: any,
  identifier: string,
  limit = 10,
  windowSeconds = 10
) {
  const windowStart = new Date(
    Date.now() -
      windowSeconds * 1000
  ).toISOString();

  const { count, error } =
    await supabase
      .from("rate_limits")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "identifier",
        identifier
      )
      .gte(
        "created_at",
        windowStart
      );

  if (error) return false;

  if ((count ?? 0) >= limit) {
    return true;
  }

  await supabase
    .from("rate_limits")
    .insert({
      identifier,
    });

  return false;
}

/*
========================
VERIFY JWT
========================
*/

function getVerifiedEmail(
  request: Request
) {
  const authHeader =
    request.headers.get(
      "Authorization"
    );

  if (
    !authHeader ||
    !authHeader.startsWith(
      "Bearer "
    )
  ) {
    throw new Error(
      "Unauthorized"
    );
  }

  const token =
    authHeader.replace(
      "Bearer ",
      ""
    );

  const decoded: any =
    jwt.verify(
      token,
      JWT_SECRET
    );

  if (!decoded?.email) {
    throw new Error(
      "Invalid token"
    );
  }

  return decoded.email
    .toLowerCase()
    .trim();
}

/*
========================
MAIN POST HANDLER
========================
*/

export async function action({
  request,
}: any) {
  const log =
    createGenerateLogger();

  log.mark("request_received", {
    method: request.method,
    origin: request.headers.get("origin") || "",
  });

  const origin =
    request.headers.get("origin") ||
    ALLOWED_ORIGIN;

  const supabase =
    createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

  log.mark("supabase_client_created");

  cleanupRateLimits(
  supabase
).catch((error) => {
  log.error("rate_limit_cleanup_failed", error);
});

  log.mark("rate_limit_cleanup_scheduled");

  const rawIp =
    request.headers.get(
      "x-forwarded-for"
    ) ||
    request.headers.get(
      "cf-connecting-ip"
    ) ||
    "";

  const ip =
    rawIp.split(",")[0].trim() ||
    "unknown";

  let email = "";

  try {
    email =
      getVerifiedEmail(
        request
      );

    log.mark("auth_verified", {
      emailHash:
        Buffer.from(email).toString("base64").slice(0, 10),
    });
  } catch (error: any) {
    log.error("auth_failed", error);

    return jsonResponse(
      {
        error:
          error?.message ===
          "Unauthorized"
            ? "Unauthorized"
            : "Invalid token",
      },
      401,
      origin
    );
  }

  const identifier =
    `${ip}:${email}`;

  if (
    await isRateLimitedDB(
      supabase,
      identifier
    )
  ) {
    log.mark("rate_limited", {
      identifierHash:
        Buffer.from(identifier).toString("base64").slice(0, 12),
    });

    return jsonResponse(
      {
        error:
          "Too many requests",
      },
      429,
      origin
    );
  }

  log.mark("rate_limit_checked");

  const {
    data: user,
    error,
  } = await supabase
    .from("bg_users")
    .select("credits, subscription_credits")
    .eq("email", email)
    .single();

  log.mark("credits_loaded", {
    foundUser: Boolean(user),
    userError: error?.message,
  });

/*
========================
DESIGN LIMIT CHECK (FIXED)
========================
*/

const { count } = await supabase
  .from("designs")
  .select("*", { count: "exact", head: true })
  .eq("user_id", email);

log.mark("design_count_loaded", {
  designCount: count ?? 0,
});

const { data: userPlan } = await supabase
  .from("bg_users")
  .select("plan_type")
  .eq("email", email)
  .single();

log.mark("plan_loaded", {
  plan: userPlan?.plan_type || "starter",
});

const limits = {
  starter: 20,
  pro: 100,
  business: 400
};

const plan = userPlan?.plan_type || "starter";
const max = limits[plan] || 25;

if ((count ?? 0) >= max) {
  log.mark("design_limit_reached", {
    designCount: count ?? 0,
    max,
    plan,
  });

  return jsonResponse(
    { error: "Design limit reached for your plan" },
    403,
    origin
  );
}

  if (error || !user) {
    log.mark("user_not_found");

    return jsonResponse(
      {
        error:
          "User not found",
      },
      404,
      origin
    );
  }

  const purchased = Number(user.credits || 0);
const sub = Number(user.subscription_credits || 0);
const total = purchased + sub;

if (total <= 0) {
  log.mark("no_credits_left", {
    purchased,
    subscription: sub,
  });

  return jsonResponse(
    { error: "No credits left" },
    403,
    origin
  );
}

  try {
    const body =
  await request.json();

log.mark("body_parsed", {
  promptLength:
    typeof body.prompt === "string"
      ? body.prompt.length
      : 0,
  quality:
    body.quality || "standard",
  transparentBackground:
    Boolean(body.transparentBackground),
  productType:
    body.productType || "",
});

const userPrompt =
  body.prompt;

const quality =
  body.quality || "standard";

const transparentBackground =
  body.transparentBackground || false;

let imageSize = "1024x1024";

let imageQuality:
  | "low"
  | "medium"
  | "high" = "high";

let imageModel =
  "gpt-image-1.5";

/*
========================
QUALITY MAPPING
========================
*/

if (quality === "basic") {
  imageSize = "1024x1024";
  imageQuality = "medium";
  imageModel = "gpt-image-1.5";
}

if (quality === "standard") {
  imageSize = "1024x1024";
  imageQuality = "high";
  imageModel = "gpt-image-1.5";
}

if (quality === "premium") {
  imageSize = "1024x1536";
  imageQuality = "high";
  imageModel = "gpt-image-1.5";
}

/*
========================
ULTRA MODE
========================
*/

if (quality === "ultra") {

  imageSize = "1024x1024";

  imageQuality = "high";

  imageModel = "gpt-image-2";

  /*
  Ultra currently does not
  support transparent BG
  */

  if (transparentBackground) {

    return jsonResponse(
      {
        error:
          "Transparent background is not supported in Ultra mode"
      },
      400,
      origin
    );
  }
}

log.mark("quality_mapped", {
  quality,
  imageSize,
  imageQuality,
  imageModel,
  transparentBackground,
});

    /*
========================
TEXT MODEL PROMPT BUILDER
========================
*/

let improvedPrompt =
  userPrompt;

if (quality === "ultra") {
  log.mark("prompt_enhancement_skipped", {
    reason:
      "ultra uses simplified original prompt",
  });
} else {
  log.mark("prompt_enhancement_start", {
    model: "gpt-4.1",
  });

  const promptBuilder =
    await openai.chat.completions.create(
      {
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content: `
You are an expert print production designer.

Rewrite customer requests into clear, high-quality design prompts for professional printing.

Rules:

- Sticker designs will get a white outline strokeline unless otherwise specified
- Please produce an image of the person, place, or thing not text unless text is specified
- Prioritize clean print-ready production quality

          `,
          },
          {
            role: "user",
            content:
              userPrompt,
          },
        ],
        temperature: 0.7,
      }
    );

  log.mark("prompt_enhancement_complete");

  improvedPrompt =
    promptBuilder
      .choices?.[0]
      ?.message?.content ||
    userPrompt;
}

/*
========================
FINAL PROMPT
========================
*/

let finalPrompt =
  improvedPrompt;

/*
========================
ULTRA PROMPT SIMPLIFIER
========================
*/

if (quality === "ultra") {

  finalPrompt = `
    ${userPrompt},
    print-ready,
    
    
  `;
}

log.mark("final_prompt_ready", {
  improvedPromptLength:
    typeof improvedPrompt === "string"
      ? improvedPrompt.length
      : 0,
  finalPromptLength:
    typeof finalPrompt === "string"
      ? finalPrompt.length
      : 0,
});

/*
========================
IMAGE GENERATION
========================
*/

log.mark("image_generation_start", {
  model: imageModel,
  size: imageSize,
  quality: imageQuality,
});

const response =
  await openai.images.generate(
    {
      model:
        imageModel,

      prompt:
        finalPrompt,

      size:
        imageSize,

      quality:
        imageQuality,

      ...(transparentBackground && {
        background:
          "transparent"
      }),
    }
  );

log.mark("image_generation_complete", {
  hasImage:
    Boolean(response.data?.[0]?.b64_json),
});

    

    const imageBase64 =
      response.data?.[0]
        ?.b64_json;

    if (!imageBase64) {
      log.mark("image_generation_empty_response");

      return jsonResponse(
        {
          error:
            "No image returned",
        },
        500,
        origin
      );
    }

    /*
========================
🔥 STORE DESIGN
========================
*/

let storedImageUrl = null;
let insertedDesign: any = null;
let filePath = "";

try {

  log.mark("storage_phase_start", {
    imageBytesApprox:
      Math.round(
        imageBase64.length * 0.75
      ),
  });

  filePath =
    `${email}/${Date.now()}.png`;

  const buffer =
    Buffer.from(
      imageBase64,
      "base64"
    );

  // =========================
  // UPLOAD TO STORAGE
  // =========================
  const { error: uploadError } =
    await supabase.storage
      .from("uploads")
      .upload(
        filePath,
        buffer,
        {
          contentType:
            "image/png",
          upsert: false,
        }
      );

  if (uploadError) {

    log.error(
      "upload_failed",
      uploadError
    );

    throw uploadError;
  }

  log.mark("upload_complete", {
    filePath,
  });

  // =========================
  // CREATE SIGNED URL
  // =========================
  const {
    data: signedData,
    error: signedError
  } =
    await supabase.storage
      .from("uploads")
      .createSignedUrl(
        filePath,
        60 * 60
      );

  if (signedError) {

    log.error(
      "signed_url_failed",
      signedError
    );
  }

  storedImageUrl =
    signedData?.signedUrl ||
    null;

  log.mark("signed_url_complete", {
    hasSignedUrl:
      Boolean(storedImageUrl),
  });

  // =========================
  // SAVE TO DATABASE
  // =========================
  const {
    data,
    error: insertError
  } =
    await supabase
      .from("designs")
      .insert({
        user_id: email,

        name:
          "generated-design",

       data: {

  /*
  STORAGE PATH
  */

  path: filePath,

  /*
  ORIGINAL PROMPT
  */

  prompt: userPrompt,

  /*
  PRODUCT TYPE
  */

  product_type:
    body.productType || "",

  /*
  DESIGN TYPE
  */

  type:
    "generated-design"
},
      })
      .select()
      .single();

  if (insertError) {

    log.error(
      "db_insert_failed",
      insertError
    );

    throw insertError;
  }

  insertedDesign = data;

  log.mark("db_insert_complete", {
    designId:
      insertedDesign?.id || null,
  });

} catch (err) {

  log.error(
    "storage_or_db_failed",
    err
  );
}    

/*
========================
ATOMIC CREDIT DEDUCTION (DB SAFE)
========================
*/

const { error: creditError } = await supabase
  .rpc("deduct_credits", {
    p_email: email,
    p_amount: 1
  });

if (creditError) {
  log.error("credit_deduction_failed", creditError);

  return jsonResponse(
    { error: "Credit deduction failed" },
    500,
    origin
  );
}

log.mark("credit_deduction_complete");

log.mark("request_complete", {
  hasImageUrl:
    Boolean(storedImageUrl),
  designId:
    insertedDesign?.id || null,
});

    return jsonResponse(
  {
    success: true,
    imageUrl: storedImageUrl,

    designId: insertedDesign?.id || null,

    designPath: filePath,

    designType: "generated-design"
  },
  200,
  origin
);
  } catch (err) {
    log.error(
      "generation_failed",
      err
    );

    const status =
      err?.status === 408 ||
      err?.code === "ETIMEDOUT" ||
      err?.name === "TimeoutError"
        ? 504
        : 500;

    return jsonResponse(
      {
        error:
          status === 504
            ? "Image generation timed out. Please try again."
            : "Generation failed",
        requestId:
          log.requestId,
      },
      status,
      origin
    );
  }
}
