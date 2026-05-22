/* eslint-disable */
// @ts-nocheck
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs
} from "@remix-run/node";

/*
==========================================
CORS PREFLIGHT HANDLER
OPTIONS /api/upload-logo
==========================================
*/

export async function loader({
  request
}: LoaderFunctionArgs) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin":
          "https://www.prntd.ca",
        "Access-Control-Allow-Methods":
          "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization"
      }
    });
  }

  return new Response(null, {
    status: 405
  });
}

/*
==========================================
UPLOAD LOGO ACTION
POST /api/upload-logo
==========================================
*/

export async function action({
  request
}: ActionFunctionArgs) {
  try {
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
      return Response.json(
        {
          success: false,
          error: "Unauthorized"
        },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin":
              "https://www.prntd.ca"
          }
        }
      );
    }

    /*
    FORM DATA
    */

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    const fileName =
      formData.get("file_name");

    if (
      !file ||
      !(file instanceof File)
    ) {
      return Response.json(
        {
          success: false,
          error: "No file uploaded"
        },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin":
              "https://www.prntd.ca"
          }
        }
      );
    }

    if (!fileName) {
      return Response.json(
        {
          success: false,
          error: "Missing file name"
        },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin":
              "https://www.prntd.ca"
          }
        }
      );
    }

    /*
    SUPABASE CONFIG
    */

    const SUPABASE_URL =
      process.env.SUPABASE_URL;

    const SUPABASE_SERVICE_ROLE_KEY =
      process.env
        .SUPABASE_SERVICE_ROLE_KEY;

    const SUPABASE_BUCKET =
      "qr-logos";

    if (
      !SUPABASE_URL ||
      !SUPABASE_SERVICE_ROLE_KEY
    ) {
      return Response.json(
        {
          success: false,
          error:
            "Supabase env vars missing"
        },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin":
              "https://www.prntd.ca"
          }
        }
      );
    }

    /*
    FILE BUFFER
    */

    const arrayBuffer =
      await file.arrayBuffer();

    const fileBuffer =
      Buffer.from(arrayBuffer);

    /*
    UPLOAD TO SUPABASE STORAGE
    */

    const uploadRes =
      await fetch(
        `${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${fileName}`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            apikey:
              SUPABASE_SERVICE_ROLE_KEY,
            "Content-Type":
              file.type ||
              "application/octet-stream",
            "x-upsert":
              "true"
          },
          body: fileBuffer
        }
      );

    if (!uploadRes.ok) {
      const uploadError =
        await uploadRes.text();

      console.error(
        "Supabase Upload Error:",
        uploadError
      );

      return Response.json(
        {
          success: false,
          error:
            "Upload to storage failed"
        },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin":
              "https://www.prntd.ca"
          }
        }
      );
    }

    /*
    PUBLIC URL
    */

    const logoUrl =
      `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${fileName}`;

    return Response.json(
      {
        success: true,
        logo_url: logoUrl
      },
      {
        headers: {
          "Access-Control-Allow-Origin":
            "https://www.prntd.ca"
        }
      }
    );

  } catch (error) {
    console.error(
      "Upload Logo Error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Upload logo failed"
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin":
            "https://www.prntd.ca"
        }
      }
    );
  }
}