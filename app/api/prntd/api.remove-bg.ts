import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY!;
const JWT_SECRET =
  process.env.JWT_SECRET!;
const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN || "";

/*
========================
CORS
========================
*/

function headers(origin?: string) {
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
        ...headers(origin),
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
    headers: headers(origin),
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
MAIN HANDLER
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

  await cleanupRateLimits(
    supabase
  );

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

  const formData =
    await request.formData();

  const file = formData.get(
    "image"
  ) as File;

  if (!file) {
    return jsonResponse(
      {
        error:
          "No image uploaded",
      },
      400,
      origin
    );
  }

  const imageBuffer =
    await file.arrayBuffer();

  const response =
    await fetch(
      "https://api.remove.bg/v1.0/removebg",
      {
        method: "POST",
        headers: {
          "X-Api-Key":
            process.env
              .REMOVE_BG_API_KEY!,
        },
        body: (() => {
          const data =
            new FormData();

          data.append(
            "image_file",
            new Blob([
              imageBuffer,
            ]),
            "image.png"
          );

          data.append(
            "size",
            "auto"
          );

          return data;
        })(),
      }
    );

  if (!response.ok) {
    console.log(
      "REMOVE.BG STATUS:",
      response.status
    );

    console.log(
      "REMOVE.BG TEXT:",
      await response.text()
    );

    return jsonResponse(
      {
        error:
          "Image processing failed",
      },
      500,
      origin
    );
  }

  const resultBlob =
    await response.blob();

  /*
========================
SAFE CREDIT DEDUCTION
========================
*/

let remaining = 2;

// use subscription first
const subUsed = Math.min(sub, remaining);
remaining -= subUsed;

// then purchased
const purchasedUsed = Math.min(purchased, remaining);
remaining -= purchasedUsed;

const newSub = sub - subUsed;
const newCredits = purchased - purchasedUsed;

/*
RACE SAFE UPDATE
*/

const { error: updateError } = await supabase
  .from("bg_users")
  .update({
    credits: newCredits,
    subscription_credits: newSub,
  })
  .eq("email", email)
  .eq("credits", user.credits)
  .eq("subscription_credits", user.subscription_credits);

if (updateError) {
  return jsonResponse(
    { error: "Conflict, retry request" },
    409,
    origin
  );
}

  return new Response(
    resultBlob,
    {
      headers: {
        ...headers(origin),
        "Content-Type":
          "image/png",
      },
    }
  );
}