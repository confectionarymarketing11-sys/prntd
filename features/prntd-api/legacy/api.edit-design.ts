/* eslint-disable */
// @ts-nocheck
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

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

export async function GET(request: Request) {
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
async function cleanupRateLimits(supabase: any) {
  if (Math.random() >= 0.05) return;

  const cutoff = new Date(
    Date.now() - 60_000
  ).toISOString();

  await supabase
    .from("rate_limits")
    .delete()
    .lt("created_at", cutoff);
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
      .eq("identifier", identifier)
      .gte("created_at", windowStart);

  if (error) return false;

  if ((count ?? 0) >= limit) {
    return true;
  }

  await supabase
    .from("rate_limits")
    .insert({ identifier });

  return false;
}

/*
========================
VERIFY JWT
========================
*/
function getVerifiedEmail(request: Request) {
  const authHeader =
    request.headers.get("Authorization");

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    throw new Error("Unauthorized");
  }

  const token =
    authHeader.replace("Bearer ", "");

  const decoded: any =
    jwt.verify(token, JWT_SECRET);

  if (!decoded?.email) {
    throw new Error("Invalid token");
  }

  return decoded.email
    .toLowerCase()
    .trim();
}

function saveBase64ToTempFile(base64Data: string) {
  const cleanBase64 =
    base64Data.replace(
      /^data:image\/[a-zA-Z]+;base64,/,
      ""
    );

  const buffer = Buffer.from(
    cleanBase64,
    "base64"
  );

  const tempFilePath = path.join(
    process.cwd(),
    `temp-edit-${Date.now()}.png`
  );

  fs.writeFileSync(tempFilePath, buffer);

  return tempFilePath;
}

async function buildEditPrompt(editRequest: string) {
  return `
Edit this existing design while preserving the original layout, proportions, spacing, and overall structure.

Apply only the requested changes:
${editRequest}

Rules:
- Keep the original design style consistent
- Preserve alignment and spacing
- Do not redesign the full artwork unless requested
- Maintain print-ready quality
- Keep text sharp and readable
- Preserve transparent background when possible
- Return only the final edited image
`;
}

async function generateEditedImage(
  originalImage: string,
  improvedEditPrompt: string
) {
  /*
  TEMPORARY SAFE VERSION
  UNTIL OPENAI IMAGE API IS UPDATED
  */

  return originalImage;
}

/*
========================
MAIN ACTION
========================
*/
export async function POST(request: Request) {
  const origin =
    request.headers.get("origin") ||
    ALLOWED_ORIGIN;

  const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  );

  await cleanupRateLimits(supabase);

  const rawIp =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("cf-connecting-ip") ||
    "";

  const ip =
    rawIp.split(",")[0].trim() ||
    "unknown";

  let email = "";

  try {
    email = getVerifiedEmail(request);
  } catch (error: any) {
    return jsonResponse(
      { error: "Unauthorized" },
      401,
      origin
    );
  }

  const identifier = `${ip}:${email}`;

  if (
    await isRateLimitedDB(
      supabase,
      identifier
    )
  ) {
    return jsonResponse(
      { error: "Too many requests" },
      429,
      origin
    );
  }

  const { data: user, error: userError } =
    await supabase
      .from("bg_users")
      .select(
        "credits, subscription_credits, plan_type"
      )
      .eq("email", email)
      .single();

  if (userError || !user) {
    return jsonResponse(
      { error: "User not found" },
      404,
      origin
    );
  }

  /*
  ========================
  DESIGN LIMIT CHECK
  ========================
  */

  const { count } = await supabase
    .from("designs")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", email);

  const limits: Record<string, number> = {
    starter: 20,
    pro: 100,
    business: 400,
  };

  const max =
    limits[user.plan_type] || 20;

  if ((count ?? 0) >= max) {
    return jsonResponse(
      {
        error:
          "Design limit reached for your plan",
      },
      403,
      origin
    );
  }

  const totalCredits =
    Number(user.credits || 0) +
    Number(user.subscription_credits || 0);

  if (totalCredits <= 0) {
    return jsonResponse(
      { error: "No credits left" },
      403,
      origin
    );
  }

  let tempFilePath = "";

  try {
    const body = await request.json();

    const originalImage =
      body.originalImage;
    const editRequest =
      body.editRequest;

    if (
      !originalImage ||
      !editRequest
    ) {
      return jsonResponse(
        {
          error:
            "originalImage and editRequest required",
        },
        400,
        origin
      );
    }

    tempFilePath =
      saveBase64ToTempFile(originalImage);

    const improvedEditPrompt =
      await buildEditPrompt(
        editRequest
      );

    const imageUrl =
      await generateEditedImage(
        originalImage,
        improvedEditPrompt
      );

    /*
    ========================
    SAVE EDITED DESIGN
    ========================
    */

    let storedImageUrl = null;

    try {
      const filePath = `${email}/${Date.now()}-edit.png`;

      const base64Data = imageUrl.replace(
        /^data:image\/png;base64,/,
        ""
      );

      const buffer = Buffer.from(
        base64Data,
        "base64"
      );

      await supabase.storage
        .from("uploads")
        .upload(filePath, buffer, {
          contentType: "image/png",
        });

      const { data: signedData } =
        await supabase.storage
          .from("uploads")
          .createSignedUrl(
            filePath,
            60 * 60
          );

      storedImageUrl =
        signedData?.signedUrl;

      await supabase
        .from("designs")
        .insert({
          user_id: email,

          name:
            "edited-design",

          data: {
            path: filePath,

            prompt:
              editRequest,

            product_type:
              body.productType || "",

            type:
              "edited-design",
          },
        });
    } catch (err) {
      console.error(
        "EDIT SAVE FAIL:",
        err
      );
    }

    const { error: creditError } =
      await supabase.rpc(
        "deduct_credits",
        {
          p_email: email,
          p_amount: 1,
        }
      );

    if (creditError) {
      console.error(
        "Credit deduction failed:",
        creditError
      );

      return jsonResponse(
        {
          error:
            "Credit deduction failed",
        },
        500,
        origin
      );
    }

    return jsonResponse(
      {
        success: true,
        imageUrl:
          storedImageUrl || imageUrl,
      },
      200,
      origin
    );
  } catch (error: any) {
    console.error(
      "Edit design error:",
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
  } finally {
    if (
      tempFilePath &&
      fs.existsSync(tempFilePath)
    ) {
      fs.unlinkSync(tempFilePath);
    }
  }
}