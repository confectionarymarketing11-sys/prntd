import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const JWT_SECRET = process.env.JWT_SECRET!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_JWT_SECRET =
  process.env.SUPABASE_JWT_SECRET!;

const ALLOWED_ORIGINS = [
  "https://www.prntd.ca",
  "https://prntd.ca"
];

const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

/*
========================
CORS
========================
*/
function getCorsHeaders(origin: string) {
  const allowed = ALLOWED_ORIGINS.includes(origin);

  return {
    "Access-Control-Allow-Origin": allowed
      ? origin
      : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization",
    "Access-Control-Allow-Methods":
      "POST, OPTIONS",
    "Access-Control-Allow-Credentials":
      "true"
  };
}

/*
========================
RATE LIMIT
========================
*/
const requestMap = new Map<string, number[]>();

function isRateLimited(
  identifier: string,
  limit = 20,
  windowMs = 60 * 1000
) {
  const now = Date.now();
  const existing = requestMap.get(identifier) || [];

  const recent = existing.filter(
    (time) => now - time < windowMs
  );

  if (recent.length >= limit) return true;

  recent.push(now);
  requestMap.set(identifier, recent);

  return false;
}

/*
========================
OPTIONS
========================
*/
export async function loader({ request }: any) {
  const origin = request.headers.get("origin") || "";

  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(origin)
  });
}

/*
========================
MAIN AUTH
========================
*/
export async function action({ request }: any) {
  const origin = request.headers.get("origin") || "";

  try {
    const body = await request.json();
    const emailRaw = body?.email || "";
    const email = emailRaw.toLowerCase().trim();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Invalid email" }),
        {
          status: 400,
          headers: {
            ...getCorsHeaders(origin),
            "Content-Type": "application/json"
          }
        }
      );
    }

    /*
    ========================
    RATE LIMIT
    ========================
    */
    const rawIp =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    const ip = rawIp.split(",")[0].trim();
    const identifier = `${ip}:${email}`;

    if (isRateLimited(identifier)) {
      return new Response(
        JSON.stringify({ error: "Too many requests" }),
        {
          status: 429,
          headers: {
            ...getCorsHeaders(origin),
            "Content-Type": "application/json"
          }
        }
      );
    }

    /*
    ========================
    GET OR CREATE USER (SAFE)
    ========================
    */

    let userId: string | null = null;

    // Try create (safe: won't duplicate)
    const { data: createdUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true
      });

    if (!createError && createdUser?.user?.id) {
      userId = createdUser.user.id;
    }

    // If already exists → fetch instead
    if (!userId) {
      const { data: list } =
        await supabaseAdmin.auth.admin.listUsers();

      const existing = list.users.find(
        (u) => u.email === email
      );

      userId = existing?.id || null;
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User lookup failed" }),
        {
          status: 500,
          headers: {
            ...getCorsHeaders(origin),
            "Content-Type": "application/json"
          }
        }
      );
    }

    /*
    ========================
    TOKENS
    ========================
    */

    const token = jwt.sign(
      { email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const supabaseToken = jwt.sign(
      {
        sub: userId,
        email,
        role: "authenticated",
        aud: "authenticated"
      },
      SUPABASE_JWT_SECRET,
      { expiresIn: "1h" }
    );

    return new Response(
      JSON.stringify({
        success: true,
        token,
        supabaseToken
      }),
      {
        status: 200,
        headers: {
          ...getCorsHeaders(origin),
          "Content-Type": "application/json"
        }
      }
    );

  } catch (err: any) {
    console.error("AUTH ERROR:", err);

    return new Response(
      JSON.stringify({
        error: err.message || "Auth failed"
      }),
      {
        status: 500,
        headers: {
          ...getCorsHeaders(origin),
          "Content-Type": "application/json"
        }
      }
    );
  }
}