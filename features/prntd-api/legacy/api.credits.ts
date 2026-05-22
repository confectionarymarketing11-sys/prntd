/* eslint-disable */
// @ts-nocheck
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
      "GET, OPTIONS",
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
MAIN LOADER
========================
*/

export async function loader({
  request,
}: any) {
  const origin =
    request.headers.get("origin") ||
    ALLOWED_ORIGIN;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders(origin),
    });
  }

  const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  );

  let email = "";

  try {
    email = getVerifiedEmail(request);
  } catch (error: any) {
    return jsonResponse(
      { error: error.message },
      401,
      origin
    );
  }

  /*
  ========================
  GET USER CREDITS
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

  // 🔥 create user ON DEMAND
  await supabase.from("bg_users").insert({
    email,
    credits: 3,
    subscription_credits: 0,
    has_received_free_credits: true
  });

  return jsonResponse(
    {
      success: true,
      credits: 3,
      subscription_credits: 0,
      total_credits: 3
    },
    200,
    origin
  );
}

  // ✅ NEW MODEL (NO CLAMPING, NO EXTRA LOGIC)
  const purchased = Number(user.credits || 0);
  const sub = Number(user.subscription_credits || 0);
  const total = purchased + sub;

  return jsonResponse(
    {
      success: true,
      credits: purchased,              // purchased only
      subscription_credits: sub,       // subscription only
      total_credits: total             // computed total
    },
    200,
    origin
  );
}