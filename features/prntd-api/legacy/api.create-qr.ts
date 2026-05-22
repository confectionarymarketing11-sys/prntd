/* eslint-disable */
// @ts-nocheck
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET =
  process.env.JWT_SECRET!;

const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN ||
  "https://www.prntd.ca";

/*
==========================================
CORS
==========================================
*/

function corsHeaders(origin?: string) {
  return {
    "Access-Control-Allow-Origin":
      origin || ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods":
      "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization",
    "Access-Control-Allow-Credentials":
      "true"
  };
}

function jsonResponse(
  body: Record<string, any>,
  status = 200,
  origin?: string
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders(origin),
        "Content-Type":
          "application/json"
      }
    }
  );
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
URL HEALTH CHECK
FIXED VERSION
GET > HEAD
==========================================
*/

async function checkUrlHealth(
  targetUrl: string
) {
  try {
    const response =
      await fetch(targetUrl, {
        method: "GET",
        redirect: "manual"
      });

    let health =
      "active";

    if (
      response.status >= 300 &&
      response.status < 400
    ) {
      health =
        "redirecting";
    }

    if (
      response.status >= 400
    ) {
      health =
        "broken";
    }

    console.log(
      "URL HEALTH CHECK:",
      targetUrl,
      response.status,
      health
    );

    return {
      url_health:
        health,
      last_checked_at:
        new Date().toISOString()
    };

  } catch (error) {
    console.error(
      "URL HEALTH ERROR:",
      error
    );

    return {
      url_health:
        "timeout",
      last_checked_at:
        new Date().toISOString()
    };
  }
}

/*
==========================================
OPTIONS / PREFLIGHT
==========================================
*/

export async function loader({
  request
}: any) {
  const origin =
    request.headers.get(
      "origin"
    ) || ALLOWED_ORIGIN;

  return new Response(null, {
    status: 200,
    headers: corsHeaders(origin)
  });
}

/*
==========================================
CREATE SMART QR
SECURE VERSION
SUBSCRIPTION LIMIT ENFORCEMENT
JWT VERIFIED
==========================================
*/

export async function action({
  request
}: any) {
  const origin =
    request.headers.get(
      "origin"
    ) || ALLOWED_ORIGIN;

  if (
    request.method !== "POST"
  ) {
    return jsonResponse(
      {
        success: false,
        error:
          "Method not allowed"
      },
      405,
      origin
    );
  }

  let verifiedEmail = "";

  /*
  ==========================================
  VERIFY AUTH
  ==========================================
  */

  try {
    verifiedEmail =
      getVerifiedEmail(
        request
      );
  } catch (error: any) {
    return jsonResponse(
      {
        success: false,
        error:
          error?.message ===
          "Unauthorized"
            ? "Unauthorized"
            : "Invalid token"
      },
      401,
      origin
    );
  }

  try {
    const body =
      await request.json();

    const {
      title,
      slug,
      destination_url,
      active = true
    } = body;

    if (
      !title ||
      !slug ||
      !destination_url
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Missing required fields"
        },
        400,
        origin
      );
    }

    /*
    ==========================================
    LOAD SUBSCRIPTION
    ==========================================
    */

    const {
      data: user,
      error: userError
    } = await supabase
      .from("bg_users")
      .select(`
        subscription_active,
        plan_type,
        max_qr_limit
      `)
      .eq(
        "email",
        verifiedEmail
      )
      .maybeSingle();

    if (
      userError ||
      !user ||
      !user.subscription_active
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Active subscription required for Smart QR codes"
        },
        403,
        origin
      );
    }

    const maxQrLimit =
      Number(
        user.max_qr_limit || 0
      );

    /*
    ==========================================
    COUNT ACTIVE QR CODES
    ==========================================
    */

    const {
      count: currentQrCount
    } = await supabase
      .from("qr_links")
      .select("id", {
        count: "exact",
        head: true
      })
      .eq(
        "customer_email",
        verifiedEmail
      )
      .eq(
        "active",
        true
      );

    const activeQrCount =
      Number(
        currentQrCount || 0
      );

    if (
      activeQrCount >=
      maxQrLimit
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            `QR limit reached (${activeQrCount}/${maxQrLimit})`
        },
        403,
        origin
      );
    }

    /*
    ==========================================
    CLEAN URL
    ==========================================
    */

    let finalUrl =
      destination_url.trim();

    if (
      !finalUrl.startsWith(
        "http://"
      ) &&
      !finalUrl.startsWith(
        "https://"
      )
    ) {
      finalUrl =
        `https://${finalUrl}`;
    }

    /*
    ==========================================
    CLEAN SLUG
    ==========================================
    */

    const cleanSlug =
      slug
        .toLowerCase()
        .trim()
        .replace(
          /[^a-z0-9-]/g,
          "-"
        )
        .replace(
          /-+/g,
          "-"
        )
        .replace(
          /^-|-$/g,
          ""
        );

    /*
    ==========================================
    CHECK DUPLICATE SLUG
    ==========================================
    */

    const {
      data: existingQr
    } = await supabase
      .from("qr_links")
      .select("id")
      .eq(
        "slug",
        cleanSlug
      )
      .maybeSingle();

    if (existingQr) {
      return jsonResponse(
        {
          success: false,
          error:
            "A QR with this slug already exists"
        },
        409,
        origin
      );
    }

    /*
    ==========================================
    URL HEALTH CHECK
    ==========================================
    */

    const healthResult =
      await checkUrlHealth(
        finalUrl
      );

    /*
    ==========================================
    CREATE QR
    ==========================================
    */

    const {
      data,
      error
    } = await supabase
      .from("qr_links")
      .insert({
        title,
        slug: cleanSlug,
        destination_url:
          finalUrl,
        active,
        customer_email:
          verifiedEmail,
        scan_count: 0,
        url_health:
          healthResult.url_health,
        last_checked_at:
          healthResult.last_checked_at,
        created_at:
          new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return jsonResponse(
        {
          success: false,
          error:
            error.message ||
            "Failed to create QR"
        },
        500,
        origin
      );
    }

    const shortUrl =
      `https://go.prntd.ca/${cleanSlug}`;

    return jsonResponse(
      {
        success: true,
        qr: data,
        short_url:
          shortUrl,
        slug: cleanSlug,
        current_usage:
          activeQrCount + 1,
        max_limit:
          maxQrLimit
      },
      200,
      origin
    );

  } catch (error: any) {
    return jsonResponse(
      {
        success: false,
        error:
          error?.message ||
          "Server error"
      },
      500,
      origin
    );
  }
}