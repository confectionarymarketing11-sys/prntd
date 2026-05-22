/* eslint-disable */
// @ts-nocheck
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

/*
========================================
ENV
========================================
*/

const SUPABASE_URL =
  process.env.SUPABASE_URL!;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY!;

const JWT_SECRET =
  process.env.JWT_SECRET!;

/*
========================================
ALLOWED ORIGINS
========================================
*/

const ALLOWED_ORIGINS = [

  "https://www.prntd.ca",

  "https://prntd.ca"
];

/*
========================================
SUPABASE
========================================
*/

const supabase =
  createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  );

/*
========================================
CORS
========================================
*/

function corsHeaders(
  origin?: string
) {

  const allowed =
    origin &&
    ALLOWED_ORIGINS.includes(origin);

  return {

    "Access-Control-Allow-Origin":
      allowed
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
          "application/json"
      }
    }
  );
}

/*
========================================
OPTIONS
========================================
*/

export async function loader({
  request
}: any) {

  const origin =
    request.headers.get(
      "origin"
    ) || "";

  return new Response(
    null,
    {

      status: 200,

      headers:
        corsHeaders(origin)
    }
  );
}

/*
========================================
VERIFY JWT
========================================
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
      "Bearer ")
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

  if (
    !decoded?.email
  ) {

    throw new Error(
      "Invalid token"
    );
  }

  return decoded.email
    .toLowerCase()
    .trim();
}

/*
========================================
MAIN
========================================
*/

export async function action({
  request
}: any) {

  const origin =
    request.headers.get(
      "origin"
    ) || "";

  /*
  ========================================
  AUTH
  ========================================
  */

  let email = "";

  try {

    email =
      getVerifiedEmail(
        request
      );

  } catch (err) {

    console.error(
      "AUTH ERROR:",
      err
    );

    return jsonResponse(
      {
        error:
          "Unauthorized"
      },
      401,
      origin
    );
  }

  /*
  ========================================
  BODY
  ========================================
  */

  try {

    const body =
      await request.json();

    const {

      front_originals,
      back_originals,

      front_flattened,
      back_flattened,

      customization,

      product_type,

      shirt_color,

      type

    } = body;

    /*
    ========================================
    VALIDATION
    ========================================
    */

    if (
      !front_flattened &&
      !back_flattened
    ) {

      return jsonResponse(
        {
          error:
            "No flattened images supplied."
        },
        400,
        origin
      );
    }

    /*
    ========================================
    INSERT
    ========================================
    */

    const {
      data,
      error
    } = await supabase
      .from("cart_designs")
      .insert({

        user_id:
          email,

        name:
          "shirt-customizer",

        data: {

        

          front_flattened:
            front_flattened || null,

          back_flattened:
            back_flattened || null,

          customization:
            customization || {},

          shirt_color:
            shirt_color || "white",

          product_type:
            product_type || "shirt",

          type:
            type || "shirt-customizer"
        }

      })
      .select()
      .single();

    /*
    ========================================
    DB ERROR
    ========================================
    */

    if (error) {

      console.error(
        "DB ERROR:",
        error
      );

      return jsonResponse(
        {
          error:
            error.message
        },
        500,
        origin
      );
    }

    /*
    ========================================
    SUCCESS
    ========================================
    */

    return jsonResponse(
      {

        success: true,

        design_id:
          data.id,

        email,

        front_flattened:
          front_flattened || null,

        back_flattened:
          back_flattened || null,

        front_originals:
          front_originals || [],

        back_originals:
          back_originals || []
      },
      200,
      origin
    );

  } catch (err: any) {

    console.error(
      "SAVE ERROR:",
      err
    );

    return jsonResponse(
      {

        error:
          err.message ||
          "Server error"
      },
      500,
      origin
    );
  }
}
