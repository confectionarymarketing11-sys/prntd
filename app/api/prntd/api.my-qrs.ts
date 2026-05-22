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
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allowed
      ? origin
      : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "GET, OPTIONS",
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
LOADER
==========================================
*/

export async function loader({ request }: any) {
  const origin = request.headers.get("origin") || "";

  /*
  ========================
  PREFLIGHT
  ========================
  */

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(origin)
    });
  }

  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return new Response(
        JSON.stringify({
          error: "Email required"
        }),
        {
          status: 400,
          headers: getCorsHeaders(origin)
        }
      );
    }

    /*
    ==========================================
    GET ALL USER QR CODES
    ==========================================
    */

    const {
      data: qrLinks,
      error
    } = await supabase
      .from("qr_links")
      .select("*")
      .eq("customer_email", email)
      .order("created_at", {
        ascending: false
      });

    if (error) {
      console.error("QR Fetch Error:", error);

      return new Response(
        JSON.stringify({
          error: error.message
        }),
        {
          status: 500,
          headers: getCorsHeaders(origin)
        }
      );
    }

    /*
    ==========================================
    CURRENT MONTH START
    ==========================================
    */

    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();

    /*
    ==========================================
    ADD MONTHLY SCANS PER QR
    ==========================================
    */

    for (const qr of qrLinks || []) {
      const { count } = await supabase
        .from("qr_scans")
        .select("*", {
          count: "exact",
          head: true
        })
        .eq("slug", qr.slug)
        .gte("scanned_at", startOfMonth);

      qr.monthly_scans = count || 0;
    }

    /*
    ==========================================
    RETURN FINAL DATA
    ==========================================
    */

    return new Response(
      JSON.stringify(qrLinks || []),
      {
        status: 200,
        headers: getCorsHeaders(origin)
      }
    );

  } catch (err: any) {
    console.error("My QRs Error:", err);

    return new Response(
      JSON.stringify({
        error: err.message || "Server error"
      }),
      {
        status: 500,
        headers: getCorsHeaders(origin)
      }
    );
  }
}