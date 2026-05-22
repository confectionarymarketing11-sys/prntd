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
    "Content-Type":
      "application/json",
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
      headers: corsHeaders(origin)
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

  if (
    request.method ===
    "OPTIONS"
  ) {
    return new Response(null, {
      status: 200,
      headers: corsHeaders(origin)
    });
  }

  return jsonResponse(
    {
      error: "Not Found"
    },
    404,
    origin
  );
}

/*
==========================================
DELETE QR
SECURE VERSION
JWT + OWNERSHIP VALIDATION
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

    const { slug } = body;

    console.log(
      "DELETE QR REQUEST:",
      {
        slug,
        customer:
          verifiedEmail
      }
    );

    /*
    ==========================================
    VALIDATION
    ==========================================
    */

    if (!slug) {
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
    VERIFY QR EXISTS + OWNERSHIP
    ==========================================
    */

    const {
      data: existingQr,
      error: findError
    } = await supabase
      .from("qr_links")
      .select(`
        id,
        title,
        slug,
        customer_email
      `)
      .eq("slug", slug)
      .eq(
        "customer_email",
        verifiedEmail
      )
      .maybeSingle();

    console.log(
      "DELETE QR LOOKUP:",
      existingQr
    );

    console.log(
      "DELETE QR LOOKUP ERROR:",
      findError
    );

    if (findError) {
      return jsonResponse(
        {
          success: false,
          error:
            "Failed to verify QR code"
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
            "QR code not found or access denied"
        },
        404,
        origin
      );
    }

    /*
    ==========================================
    DELETE RELATED SCAN ANALYTICS
    ==========================================
    */

    const {
  error: scanDeleteError
} = await supabase
  .from("qr_scans")
  .delete()
  .eq("qr_id", existingQr.id);

console.log(
  "SCAN DELETE ERROR:",
  scanDeleteError
);

    console.log(
      "SCAN DELETE ERROR:",
      scanDeleteError
    );

    /*
    ==========================================
    DELETE MAIN QR RECORD
    ==========================================
    */

    const {
      error: deleteError
    } = await supabase
      .from("qr_links")
      .delete()
      .eq("slug", slug)
      .eq(
        "customer_email",
        verifiedEmail
      );

    console.log(
      "QR DELETE ERROR:",
      deleteError
    );

    if (deleteError) {
      return jsonResponse(
        {
          success: false,
          error:
            deleteError.message ||
            "Delete failed"
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
          "QR deleted successfully",
        deleted_slug: slug
      },
      200,
      origin
    );

  } catch (err: any) {
    console.error(
      "DELETE QR SERVER ERROR:",
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