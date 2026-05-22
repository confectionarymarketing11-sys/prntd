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

export async function loader({ request }: any) {
  const origin =
    request.headers.get("origin") ||
    ALLOWED_ORIGIN;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders(origin),
    });
  }

  return new Response(null, {
    status: 200,
    headers: corsHeaders(origin),
  });
}

/*
========================
STRICT EMAIL VALIDATION
========================
*/

function isValidEmail(email: string) {
  if (!email) return false;

  const cleaned = email.toLowerCase().trim();

  if (
    cleaned === "undefined" ||
    cleaned === "null" ||
    cleaned.length < 5
  ) return false;

  // simple sanity check
  return cleaned.includes("@");
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

  const email =
    decoded?.email
      ?.toLowerCase()
      ?.trim();

  // 🔥 HARD BLOCK
  if (!isValidEmail(email)) {
    throw new Error("Invalid email");
  }

  return email;
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

  const supabase =
    createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

  let email = "";

  try {
    email = getVerifiedEmail(request);
  } catch (error: any) {
    return jsonResponse(
      {
        error:
          error?.message === "Unauthorized"
            ? "Unauthorized"
            : "Invalid token",
      },
      401,
      origin
    );
  }

  // 🔥 FINAL SAFETY NET (never trust upstream)
  if (!isValidEmail(email)) {
    return jsonResponse(
      { error: "Invalid email" },
      400,
      origin
    );
  }

  try {

    const {
      data: user,
      error: fetchError,
    } = await supabase
      .from("bg_users")
      .select(
        "credits, has_received_free_credits"
      )
      .eq("email", email)
      .maybeSingle();

    if (fetchError) {
      console.error("Fetch user error:", fetchError);

      return jsonResponse(
        { error: "Could not check user" },
        500,
        origin
      );
    }

    if (!user) {
      const { error: insertError } =
        await supabase
          .from("bg_users")
          .insert({
            email,
            credits: 3,
            has_received_free_credits: true,
          });

      if (insertError) {
        console.error("Insert user error:", insertError);

        return jsonResponse(
          { error: "Could not create user" },
          500,
          origin
        );
      }

      return jsonResponse(
        {
          success: true,
          newUser: true,
          credits: 3,
          message: "Welcome credits added",
        },
        200,
        origin
      );
    }

    if (!user.has_received_free_credits) {
      const newCredits =
        (user.credits || 0) + 3;

      const { error: updateError } =
        await supabase
          .from("bg_users")
          .update({
            credits: newCredits,
            has_received_free_credits: true,
          })
          .eq("email", email)
          .eq(
            "has_received_free_credits",
            false
          );

      if (updateError) {
        console.error("Update bonus error:", updateError);

        return jsonResponse(
          { error: "Could not apply welcome credits" },
          500,
          origin
        );
      }

      return jsonResponse(
        {
          success: true,
          newUser: false,
          credits: newCredits,
          message: "Welcome credits applied",
        },
        200,
        origin
      );
    }

    return jsonResponse(
      {
        success: true,
        newUser: false,
        credits: user.credits || 0,
        message: "User already exists",
      },
      200,
      origin
    );

  } catch (error: any) {
    console.error("Create user error:", error);

    return jsonResponse(
      { error: "Server error" },
      500,
      origin
    );
  }
}