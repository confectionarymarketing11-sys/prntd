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
CORS HELPERS
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

export async function loader({
  request
}: any) {

  const origin =
    request.headers.get(
      "origin"
    ) || ALLOWED_ORIGIN;

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
  request
}: any) {

  const origin =
    request.headers.get(
      "origin"
    ) || ALLOWED_ORIGIN;

  const supabase =
    createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

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

  try {

    /*
    ========================
    FETCH DESIGNS
    ========================
    */

    const {
      data,
      error
    } = await supabase
      .from("designs")
      .select(`
        data,
        created_at
      `)
      .eq(
        "user_id",
        email
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );

    if (error) {

      console.error(
        "DB ERROR:",
        error
      );

      return jsonResponse(
        {
          error:
            "Failed to load designs"
        },
        500,
        origin
      );
    }

    /*
    ========================
    FORMAT RESPONSE
    ========================
    */

    const designsRaw =
      await Promise.all(

        (data || []).map(
          async (d: any) => {

            const path =
  d.data?.path;

            if (!path) {

              return null;
            }

            const {
              data: signed,
              error: signedError
            } =
              await supabase
                .storage
                .from(
                  "uploads"
                )
                .createSignedUrl(
                  path,
                  60 * 60
                );

            if (signedError) {

              console.error(
                "SIGNED URL ERROR:",
                signedError
              );

              return null;
            }

            return {

              /*
              IMAGE URL
              */

              url:
                signed?.signedUrl ||
                null,

              /*
              STORAGE PATH
              */

              path,

              /*
              DATE
              */

              created_at:
                d.created_at,

              /*
              PRODUCT TYPE
              */

              product_type:
  d.data
    ?.product_type ||
  "",

              /*
              ORIGINAL PROMPT
              */

              prompt:
                d.data
                  ?.prompt ||
                "",

              /*
              DESIGN TYPE
              */

              design_type:
                d.data
                  ?.type ||
                ""
            };
          }
        )
      );

    /*
    REMOVE NULLS
    */

    const designs =
      designsRaw.filter(
        (d) => d && d.url
      );

    /*
    ========================
    RESPONSE
    ========================
    */

    return jsonResponse(
      { designs },
      200,
      origin
    );

  } catch (err: any) {

    console.error(
      "GET DESIGNS ERROR:",
      err
    );

    return jsonResponse(
      {
        error:
          err.message ||
          "Server error",
      },
      500,
      origin
    );
  }
}
