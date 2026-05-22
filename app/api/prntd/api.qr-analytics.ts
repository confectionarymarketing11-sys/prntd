import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function loader({ request }: any) {

  /*
  ==========================================
  CORS PREFLIGHT (REQUIRED)
  ==========================================
  */
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }

  try {
    const url = new URL(request.url);

    const email = url.searchParams.get("email");

    if (!email) {
      return Response.json(
        {
          success: false,
          error: "Missing email"
        },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }
        }
      );
    }

    /*
    ==========================================
    GET SCAN ANALYTICS
    ==========================================
    */

    const {
      data: scans,
      error: scanError
    } = await supabase
      .from("qr_scans")
      .select(`
        country,
        device_type,
        is_unique_scan,
        scanned_at
      `)
      .eq("customer_email", email)
      .order("scanned_at", {
        ascending: false
      });

    if (scanError) {
      console.error("QR Scan Analytics Error:", scanError);

      return Response.json(
        {
          success: false,
          error: scanError.message
        },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }
        }
      );
    }

    /*
    ==========================================
    GET URL HEALTH DATA
    ==========================================
    */

    const {
      data: qrHealthData,
      error: qrHealthError
    } = await supabase
      .from("qr_links")
      .select(`
        url_health,
        last_checked_at
      `)
      .eq("customer_email", email)
      .order("last_checked_at", {
        ascending: false
      })
      .limit(1)
      .maybeSingle();

    if (qrHealthError) {
      console.error("QR Health Error:", qrHealthError);
    }

    /*
    ==========================================
    GET CURRENT MONTH TOTAL SCANS
    ==========================================
    */

    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();

    const { count: monthlyScansTotal } = await supabase
      .from("qr_scans")
      .select("*", {
        count: "exact",
        head: true
      })
      .eq("customer_email", email)
      .gte("scanned_at", startOfMonth);

    /*
    ==========================================
    EMPTY STATE
    ==========================================
    */

    if (!scans || scans.length === 0) {
      return Response.json(
        {
          success: true,
          topCountry: "-",
          topDevice: "-",
          uniqueVisitors: 0,
          lastScan: null,
          monthlyScansTotal: monthlyScansTotal || 0,
          urlHealth: qrHealthData?.url_health || "-",
          lastChecked: qrHealthData?.last_checked_at || null
        },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }
        }
      );
    }

    /*
    ==========================================
    CALCULATE ANALYTICS
    ==========================================
    */

    const countryCounts: any = {};
    const deviceCounts: any = {};

    let uniqueVisitors = 0;
    let lastScan = scans[0]?.scanned_at || null;

    scans.forEach((scan) => {
      const country = scan.country || "Unknown";
      countryCounts[country] =
        (countryCounts[country] || 0) + 1;

      const device = scan.device_type || "Unknown";
      deviceCounts[device] =
        (deviceCounts[device] || 0) + 1;

      if (scan.is_unique_scan) {
        uniqueVisitors += 1;
      }
    });

    const topCountry =
      Object.keys(countryCounts).sort(
        (a, b) => countryCounts[b] - countryCounts[a]
      )[0] || "-";

    const topDevice =
      Object.keys(deviceCounts).sort(
        (a, b) => deviceCounts[b] - deviceCounts[a]
      )[0] || "-";

    /*
    ==========================================
    SUCCESS RESPONSE
    ==========================================
    */

    return Response.json(
      {
        success: true,
        topCountry,
        topDevice,
        uniqueVisitors,
        lastScan,
        monthlyScansTotal: monthlyScansTotal || 0,
        urlHealth: qrHealthData?.url_health || "-",
        lastChecked: qrHealthData?.last_checked_at || null
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      }
    );

  } catch (error: any) {
    console.error("QR Analytics Fatal Error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Server error"
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      }
    );
  }
}