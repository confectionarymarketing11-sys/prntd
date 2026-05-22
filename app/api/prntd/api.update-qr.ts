import { json } from "@remix-run/node";
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
  return json(body, {
    status,
    headers: {
      ...corsHeaders(origin)
    }
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
URL HEALTH CHECK
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

    return {
      url_health:
        health,
      last_checked_at:
        new Date().toISOString()
    };

  } catch (error) {
    console.error(
      "URL health check failed:",
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
UPDATE QR
SECURE VERSION
JWT + EMAIL OWNERSHIP CHECK
+ URL HEALTH RECHECK
==========================================
*/

export async function action({
  request
}: any) {
  const origin =
    request.headers.get(
      "origin"
    ) || ALLOWED_ORIGIN;

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
      slug,
      destination_url
    } = body;

    /*
    ==========================================
    VALIDATION
    ==========================================
    */

    if (
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
    VERIFY QR BELONGS TO USER
    ==========================================
    */

    const {
      data: existingQr,
      error: findError
    } = await supabase
      .from("qr_links")
      .select(`
        id,
        slug,
        customer_email
      `)
      .eq("slug", slug)
      .eq(
        "customer_email",
        verifiedEmail
      )
      .maybeSingle();

    if (findError) {
      console.error(
        "QR lookup error:",
        findError
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Failed to verify QR ownership"
        },
        500,
        origin
      );
    }

    if (!existingQr) {
      return jsonResponse(
        {
          success: false,
          error:
            "QR not found or access denied"
        },
        404,
        origin
      );
    }

    /*
    ==========================================
    RECHECK URL HEALTH
    ==========================================
    */

    const healthResult =
      await checkUrlHealth(
        finalUrl
      );

    /*
    ==========================================
    UPDATE QR
    ==========================================
    */

    const {
      data,
      error
    } = await supabase
      .from("qr_links")
      .update({
        destination_url:
          finalUrl,
        url_health:
          healthResult.url_health,
        last_checked_at:
          healthResult.last_checked_at
      })
      .eq("slug", slug)
      .eq(
        "customer_email",
        verifiedEmail
      )
      .select()
      .single();

    if (error) {
      console.error(
        "QR update error:",
        error
      );

      return jsonResponse(
        {
          success: false,
          error:
            error.message ||
            "Failed to update QR"
        },
        500,
        origin
      );
    }

    /*
    ==========================================
    SUCCESS
    ==========================================
    */

    return jsonResponse(
      {
        success: true,
        message:
          "QR updated successfully",
        updated_qr: data
      },
      200,
      origin
    );

  } catch (err: any) {
    console.error(
      "Update QR fatal error:",
      err
    );

    return jsonResponse(
      {
        success: false,
        error:
          err.message ||
          "Server error"
      },
      500,
      origin
    );
  }
}