import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY!;
const JWT_SECRET = process.env.JWT_SECRET!;
const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN || "";

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
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json",
    },
  });
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

  const token = authHeader.replace(
    "Bearer ",
    ""
  );

  const decoded: any = jwt.verify(
    token,
    JWT_SECRET
  );

  if (!decoded?.email) {
    throw new Error("Invalid token");
  }

  return decoded.email
    .toLowerCase()
    .trim();
}

/*
========================
MAIN ACTION
========================
*/

export async function action({ request }: any) {
  const origin =
    request.headers.get("origin") ||
    ALLOWED_ORIGIN;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders(origin),
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      { error: "Method not allowed" },
      405,
      origin
    );
  }

  const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  );

  let email = "";

  try {
    email = getVerifiedEmail(request);
  } catch (err: any) {
    return jsonResponse(
      { error: err.message },
      401,
      origin
    );
  }

  let amount = 0;

  try {
    const body = await request.json();
    amount = Number(body.amount || 0);
  } catch {
    return jsonResponse(
      { error: "Invalid JSON" },
      400,
      origin
    );
  }

  if (amount <= 0) {
    return jsonResponse(
      { error: "Invalid amount" },
      400,
      origin
    );
  }

  /*
  ========================
  LOAD USER
  ========================
  */

  const {
    data: user,
    error: userError,
  } = await supabase
    .from("bg_users")
    .select("credits, subscription_credits")
    .eq("email", email)
    .single();

  if (userError || !user) {
    return jsonResponse(
      { error: "User not found" },
      404,
      origin
    );
  }

  const purchased = Number(user.credits || 0); // 👈 purchased only
  const sub = Number(user.subscription_credits || 0);

  /*
  ========================
  CHECK TOTAL
  ========================
  */

  if (sub + purchased < amount) {
    return jsonResponse(
      { error: "Not enough credits" },
      400,
      origin
    );
  }

  /*
  ========================
  CALCULATE (NEW MODEL)
  ========================
  */

  let remaining = amount;

  // use subscription first
  const subUsed = Math.min(sub, remaining);
  remaining -= subUsed;

  // then use purchased credits
  const purchasedUsed = Math.min(purchased, remaining);
  remaining -= purchasedUsed;

  const newSub = sub - subUsed;
  const newPurchased = purchased - purchasedUsed;

  /*
  ========================
  UPDATE (RACE SAFE)
  ========================
  */

  const { error: updateError } = await supabase
    .from("bg_users")
    .update({
      credits: newPurchased,
      subscription_credits: newSub,
    })
    .eq("email", email)
    .eq("credits", purchased); // concurrency guard

  if (updateError) {
    return jsonResponse(
      { error: "Conflict, retry request" },
      409,
      origin
    );
  }

  /*
  ========================
  RESPONSE
  ========================
  */

  return jsonResponse(
    {
      success: true,
      credits: newPurchased,                // purchased only
      subscription_credits: newSub,         // subscription only
      total_credits: newPurchased + newSub  // 👈 NEW (for UI)
    },
    200,
    origin
  );
}