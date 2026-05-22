/* eslint-disable */
// @ts-nocheck
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import jwt from "jsonwebtoken";

const SUPABASE_URL =
  process.env.SUPABASE_URL!;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env
    .SUPABASE_SERVICE_ROLE_KEY!;

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
==========================================
CORS
==========================================
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

export async function GET(
  request: Request
) {
  const origin =
    request.headers.get("origin") ||
    ALLOWED_ORIGIN;

  return new Response(null, {
    status: 200,
    headers: corsHeaders(origin),
  });
}

/*
==========================================
VERIFY JWT
==========================================
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
==========================================
RATE LIMIT
==========================================
*/

async function isRateLimitedDB(
  supabase: any,
  identifier: string,
  limit = 10,
  windowSeconds = 10
) {
  const windowStart =
    new Date(
      Date.now() -
        windowSeconds * 1000
    ).toISOString();

  const { count } =
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
==========================================
PROMPT BUILDER
==========================================
*/

function buildEditPrompt(
  editRequest: string
) {
  return `
Edit this uploaded image.

Apply these requested changes:
${editRequest}

Rules:
- Preserve image quality
- Preserve transparent background
- Keep proportions natural
- Maintain original style
- Keep text sharp
- Return only the final edited image
`;
}

/*
==========================================
MAIN ACTION
==========================================
*/

export async function POST(
  request: Request
) {
  const origin =
    request.headers.get("origin") ||
    ALLOWED_ORIGIN;

  const supabase =
    createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

  /*
  ==========================================
  AUTH
  ==========================================
  */

  let email = "";

  try {
    email =
      getVerifiedEmail(request);
  } catch {
    return jsonResponse(
      {
        error: "Unauthorized",
      },
      401,
      origin
    );
  }

  /*
  ==========================================
  RATE LIMIT
  ==========================================
  */

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

  const identifier =
    `${ip}:${email}`;

  const limited =
    await isRateLimitedDB(
      supabase,
      identifier
    );

  if (limited) {
    return jsonResponse(
      {
        error:
          "Too many requests",
      },
      429,
      origin
    );
  }

  /*
  ==========================================
  USER
  ==========================================
  */

  const {
    data: user,
    error: userError,
  } = await supabase
    .from("bg_users")
    .select(`
      credits,
      subscription_credits,
      plan_type
    `)
    .eq("email", email)
    .single();

  if (userError || !user) {
    return jsonResponse(
      {
        error:
          "User not found",
      },
      404,
      origin
    );
  }

  /*
  ==========================================
  DESIGN LIMIT
  ==========================================
  */

  const { count } =
    await supabase
      .from("designs")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", email);

  const limits: Record<
    string,
    number
  > = {
    starter: 20,
    pro: 100,
    business: 400,
  };

  const max =
    limits[
      user.plan_type as string
    ] || 20;

  if ((count ?? 0) >= max) {
    return jsonResponse(
      {
        error:
          "Design limit reached",
      },
      403,
      origin
    );
  }

  /*
  ==========================================
  CREDITS
  ==========================================
  */

  const totalCredits =
    Number(user.credits || 0) +
    Number(
      user.subscription_credits || 0
    );

  if (totalCredits <= 0) {
    return jsonResponse(
      {
        error:
          "No credits left",
      },
      403,
      origin
    );
  }

  try {
    /*
    ==========================================
    FORM DATA
    ==========================================
    */

    const formData =
      await request.formData();

    const image =
      formData.get(
        "image"
      ) as File;

    const editRequest =
      formData.get(
        "editRequest"
      ) as string;

    if (!image) {
      return jsonResponse(
        {
          error:
            "Image required",
        },
        400,
        origin
      );
    }

    if (!editRequest) {
      return jsonResponse(
        {
          error:
            "Edit request required",
        },
        400,
        origin
      );
    }

    /*
    ==========================================
    TEMP IMAGE PASS THROUGH
    ==========================================
    */

    const imageBuffer =
      Buffer.from(
        await image.arrayBuffer()
      );

    const imageBase64 =
      imageBuffer.toString(
        "base64"
      );

    const finalBase64 =
      imageBase64;

    /*
    ==========================================
    STORAGE
    ==========================================
    */

    const finalBuffer =
      Buffer.from(
        finalBase64,
        "base64"
      );

    const filePath =
      `${email}/${Date.now()}-edit.png`;

    const upload =
      await supabase.storage
        .from("uploads")
        .upload(
          filePath,
          finalBuffer,
          {
            contentType:
              "image/png",
          }
        );

    if (upload.error) {
      throw new Error(
        "Upload failed"
      );
    }

    const {
      data: signedData,
    } =
      await supabase.storage
        .from("uploads")
        .createSignedUrl(
          filePath,
          60 * 60
        );

    const imageUrl =
      signedData?.signedUrl;

    /*
    ==========================================
    SAVE DESIGN
    ==========================================
    */

    await supabase
      .from("designs")
      .insert({
        user_id: email,

        name:
          "edited-image",

        data: {
          path: filePath,
          type: "edited",
          prompt: editRequest,
        },
      });

    /*
    ==========================================
    DEDUCT CREDITS
    ==========================================
    */

    const {
      error: creditError,
    } = await supabase.rpc(
      "deduct_credits",
      {
        p_email: email,
        p_amount: 1,
      }
    );

    if (creditError) {
      throw new Error(
        "Credit deduction failed"
      );
    }

    /*
    ==========================================
    RESPONSE
    ==========================================
    */

    return jsonResponse(
      {
        success: true,
        imageUrl,
      },
      200,
      origin
    );
  } catch (error: any) {
    console.error(
      "EDIT IMAGE ERROR:",
      error
    );

    return jsonResponse(
      {
        error:
          error?.message ||
          "Edit failed",
      },
      500,
      origin
    );
  }
}