import type {
  ActionFunctionArgs,
  LoaderFunctionArgs
} from "@remix-run/node";

import { createClient } from "@supabase/supabase-js";

/*
==========================================
ALLOWED ORIGINS (OPTION A)
==========================================
*/

const ALLOWED_ORIGINS = [
  "https://www.prntd.ca",
  "https://prntd.ca"
];

function getCorsHeaders(origin: string) {
  const allowed = ALLOWED_ORIGINS.includes(origin);

  return {
    "Access-Control-Allow-Origin": allowed
      ? origin
      : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}

/*
==========================================
SUPABASE
==========================================
*/

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/*
==========================================
CORS PREFLIGHT HANDLER
OPTIONS /api/custom-qr
==========================================
*/

export async function loader({
  request
}: LoaderFunctionArgs) {
  const origin = request.headers.get("origin") || "";

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(origin)
    });
  }

  return new Response(null, {
    status: 405,
    headers: getCorsHeaders(origin)
  });
}

/*
==========================================
CUSTOM BRANDED QR
POST /api/custom-qr
==========================================
*/

export async function action({
  request
}: ActionFunctionArgs) {
  const origin = request.headers.get("origin") || "";

  try {
    /*
    ========================
    AUTH CHECK
    ========================
    */

    const authHeader =
      request.headers.get("Authorization");

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized"
        },
        {
          status: 401,
          headers: {
            ...getCorsHeaders(origin)
          }
        }
      );
    }

    /*
    ========================
    REQUEST BODY
    ========================
    */

    const body = await request.json();

    const {
      slug,
      destination_url,
      logo_url,
      brand_color,
      style,
      cta_text
    } = body;

    if (!destination_url) {
      return Response.json(
        {
          success: false,
          error: "Missing destination URL"
        },
        {
          status: 400,
          headers: {
            ...getCorsHeaders(origin)
          }
        }
      );
    }

    /*
    ========================
    SEND TO QR WORKER
    ========================
    */

    const workerResponse = await fetch(
      "https://prntd-qr-worker.onrender.com/generate-branded-qr",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: destination_url,
          logo_url: logo_url || "",
          brand_color: brand_color || "#000000",
          style: style || "standard",
          cta_text: cta_text || ""
        })
      }
    );

    const workerData = await workerResponse.json();

    if (!workerData.success) {
      return Response.json(
        {
          success: false,
          error:
            workerData.error || "Worker failed"
        },
        {
          status: 500,
          headers: {
            ...getCorsHeaders(origin)
          }
        }
      );
    }

    /*
    ========================
    SAVE TO SUPABASE
    ========================
    */

    if (slug) {
      const { error: updateError } =
        await supabase
          .from("qr_links")
          .update({
            custom_qr_image:
              workerData.qr_image
          })
          .eq("slug", slug);

      if (updateError) {
        console.error(
          "SUPABASE UPDATE ERROR:",
          updateError
        );
      }
    }

    /*
    ========================
    SUCCESS
    ========================
    */

    return Response.json(
      {
        success: true,
        qr_image: workerData.qr_image
      },
      {
        status: 200,
        headers: {
          ...getCorsHeaders(origin)
        }
      }
    );

  } catch (error) {
    console.error(
      "Custom QR Error:",
      error
    );

    return Response.json(
      {
        success: false,
        error: "Custom QR generation failed"
      },
      {
        status: 500,
        headers: {
          ...getCorsHeaders(origin)
        }
      }
    );
  }
}