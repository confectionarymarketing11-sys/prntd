/* eslint-disable */
// @ts-nocheck
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY!;
const JWT_SECRET = process.env.JWT_SECRET!;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "";

/*
========================
CORS
========================
*/
function corsHeaders(origin?: string) {
  return {
    "Access-Control-Allow-Origin": origin || ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
  };
}

function jsonResponse(body: any, status: number, origin?: string) {
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
OPTIONS
========================
*/
export async function loader({ request }: any) {
  const origin =
    request.headers.get("origin") || ALLOWED_ORIGIN;

  return new Response(null, {
    status: 200,
    headers: corsHeaders(origin),
  });
}

/*
========================
VERIFY JWT
========================
*/
function getVerifiedEmail(request: Request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.replace("Bearer ", "");

  const decoded: any = jwt.verify(token, JWT_SECRET);

  if (!decoded?.email) {
    throw new Error("Invalid token");
  }

  return decoded.email.toLowerCase().trim();
}

/*
========================
MAIN
========================
*/
export async function action({ request }: any) {
  const origin =
    request.headers.get("origin") || ALLOWED_ORIGIN;

  const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  );

  let email = "";

  try {
    email = getVerifiedEmail(request);
  } catch {
    return jsonResponse({ error: "Unauthorized" }, 401, origin);
  }

  try {
    const body = await request.json();
    const path = body?.path;

    if (!path) {
      return jsonResponse({ error: "Missing path" }, 400, origin);
    }

    /*
    ========================
    🔒 SECURITY CHECK
    ========================
    */

    // ensure user only deletes their own files
    if (!path.startsWith(email + "/")) {
      return jsonResponse({ error: "Forbidden" }, 403, origin);
    }

    /*
    ========================
    DELETE FROM STORAGE
    ========================
    */

    const { error: storageError } =
      await supabase.storage
        .from("uploads")
        .remove([path]);

    if (storageError) {
      console.error("STORAGE DELETE ERROR:", storageError);
      return jsonResponse(
        { error: "Storage delete failed" },
        500,
        origin
      );
    }

    /*
    ========================
    DELETE FROM DATABASE
    ========================
    */

    const { error: dbError } = await supabase
      .from("designs")
      .delete()
      .eq("user_id", email)
      .contains("data", { path });

    if (dbError) {
      console.error("DB DELETE ERROR:", dbError);
      return jsonResponse(
        { error: "DB delete failed" },
        500,
        origin
      );
    }

    /*
    ========================
    SUCCESS
    ========================
    */

    return jsonResponse({ success: true }, 200, origin);

  } catch (err: any) {
    console.error("DELETE ERROR:", err);

    return jsonResponse(
      { error: err.message || "Server error" },
      500,
      origin
    );
  }
}