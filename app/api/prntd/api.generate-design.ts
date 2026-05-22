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

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

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
  const origin =
    request.headers.get("origin") ||
    ALLOWED_ORIGIN;

  const supabase =
    createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

  cleanupRateLimits(
  supabase
).catch(console.error);

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
  } catch (error: any) {
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
    return jsonResponse(
      {
        error:
          "Too many requests",
      },
      429,
      origin
    );
  }

  const {
    data: user,
    error,
  } = await supabase
    .from("bg_users")
    .select("credits, subscription_credits")
    .eq("email", email)
    .single();

/*
========================
DESIGN LIMIT CHECK (FIXED)
========================
*/

const { count } = await supabase
  .from("designs")
  .select("*", { count: "exact", head: true })
  .eq("user_id", email);

const { data: userPlan } = await supabase
  .from("bg_users")
  .select("plan_type")
  .eq("email", email)
  .single();

const limits = {
  starter: 20,
  pro: 100,
  business: 400
};

const plan = userPlan?.plan_type || "starter";
const max = limits[plan] || 25;

if ((count ?? 0) >= max) {
  return jsonResponse(
    { error: "Design limit reached for your plan" },
    403,
    origin
  );
}

  if (error || !user) {
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
  return jsonResponse(
    { error: "No credits left" },
    403,
    origin
  );
}

  try {
    const body =
  await request.json();

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

    /*
========================
TEXT MODEL PROMPT BUILDER
========================
*/

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

const improvedPrompt =
  promptBuilder
    .choices?.[0]
    ?.message?.content ||
  userPrompt;

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

console.log(
  "USER PROMPT:",
  userPrompt
);

console.log(
  "FINAL PROMPT:",
  finalPrompt
);

/*
========================
IMAGE GENERATION
========================
*/

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

    

    const imageBase64 =
      response.data?.[0]
        ?.b64_json;

    if (!imageBase64) {
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

    console.error(
      "UPLOAD ERROR:",
      uploadError
    );

    throw uploadError;
  }

  console.log(
    "UPLOAD SUCCESS:",
    filePath
  );

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

    console.error(
      "SIGNED URL ERROR:",
      signedError
    );
  }

  storedImageUrl =
    signedData?.signedUrl ||
    null;

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

    console.error(
      "DB INSERT ERROR:",
      insertError
    );

    throw insertError;
  }

  insertedDesign = data;

  console.log(
    "DB INSERT SUCCESS"
  );

} catch (err) {

  console.error(
    "STORAGE FAIL:",
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
  console.error("Credit deduction failed:", creditError);

  return jsonResponse(
    { error: "Credit deduction failed" },
    500,
    origin
  );
}

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
    console.error(
      "Generate design error:",
      err
    );

    return jsonResponse(
      {
        error:
          "Generation failed",
      },
      500,
      origin
    );
  }
}
