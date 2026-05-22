import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function loader({ request, params }: any) {
  const slug = params.slug;

  console.log("==================================");
  console.log("SCAN ROUTE START");
  console.log("LOOKING FOR SLUG:", slug);
  console.log("==================================");

  if (!slug) {
    return new Response("Missing slug", {
      status: 400
    });
  }

  /*
  ==========================================
  FIND QR LINK
  ==========================================
  */

  const { data, error } = await supabase
    .from("qr_links")
    .select(`
      id,
      destination_url,
      active,
      slug,
      scan_count,
      customer_email
    `)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) {
    console.log("QR LOOKUP ERROR:", error);

    return new Response("QR link not found", {
      status: 404
    });
  }

  /*
  ==========================================
  REQUEST DATA
  ==========================================
  */

  const userAgent =
    request.headers.get("user-agent") ||
    "unknown";

  console.log("USER AGENT:", userAgent);

  const lowerUA = userAgent.toLowerCase();

  const rawIp =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("cf-connecting-ip") ||
    "";

  const ip =
    rawIp
      .split(",")[0]
      .trim() || "unknown";

  const country =
    request.headers.get("cf-ipcountry") ||
    "Unknown";

  /*
  ==========================================
  BLOCK PREVIEW / BOT / APP TRAFFIC
  DO NOT COUNT THESE
  ==========================================
  */

  const isPreviewTraffic =
    lowerUA.includes("shopify") ||
    lowerUA.includes("facebookexternalhit") ||
    lowerUA.includes("instagram") ||
    lowerUA.includes("whatsapp") ||
    lowerUA.includes("preview") ||
    lowerUA.includes("headless") ||
    lowerUA.includes("bot") ||
    lowerUA.includes("crawler") ||
    lowerUA.includes("spider");

  if (isPreviewTraffic) {
    console.log("BLOCKED PREVIEW TRAFFIC:", userAgent);

    let previewUrl = data.destination_url;

    if (
      !previewUrl.startsWith("http://") &&
      !previewUrl.startsWith("https://")
    ) {
      previewUrl = `https://${previewUrl}`;
    }

    return Response.redirect(previewUrl, 302);
  }

  /*
  ==========================================
  BETTER DEVICE DETECTION
  ==========================================
  */

  let deviceType = "Desktop";

  if (
    lowerUA.includes("iphone") ||
    lowerUA.includes("android") ||
    lowerUA.includes("mobile") ||
    lowerUA.includes("phone") ||
    lowerUA.includes("ios") ||
    lowerUA.includes("samsung") ||
    lowerUA.includes("pixel") ||
    lowerUA.includes("huawei") ||
    lowerUA.includes("oneplus")
  ) {
    deviceType = "Mobile";
  }

  if (
    lowerUA.includes("ipad") ||
    lowerUA.includes("tablet")
  ) {
    deviceType = "Tablet";
  }

  /*
  ==========================================
  BROWSER DETECTION
  ==========================================
  */

  let browser = "Other";

  if (lowerUA.includes("edg")) {
    browser = "Edge";
  } else if (lowerUA.includes("chrome")) {
    browser = "Chrome";
  } else if (lowerUA.includes("safari")) {
    browser = "Safari";
  } else if (lowerUA.includes("firefox")) {
    browser = "Firefox";
  }

  /*
  ==========================================
  SOFT-FAIL CITY LOOKUP
  NEVER BLOCK REDIRECT
  ==========================================
  */

  let city = "Unknown";
  let region = "Unknown";

  try {
    if (ip !== "unknown") {
      const geoRes = await fetch(
        `https://ipapi.co/${ip}/json/`
      );

      if (geoRes.ok) {
        const geoData = await geoRes.json();

        city = geoData.city || "Unknown";
        region = geoData.region || "Unknown";
      }
    }
  } catch (err) {
    console.log("CITY LOOKUP FAILED:", err);
  }

  /*
  ==========================================
  UNIQUE SCAN CHECK
  SAME IP + SAME QR
  ==========================================
  */

  /*
==========================================
PREVENT DOUBLE SCANS
SAME QR + SAME IP + RECENT WINDOW
==========================================
*/

const tenMinutesAgo = new Date(
  Date.now() - 10 * 60 * 1000
).toISOString();

const {
  data: existingScan
} = await supabase
  .from("qr_scans")
  .select("id")
  .eq("slug", slug)
  .eq("ip_address", ip)
  .gte("scanned_at", tenMinutesAgo)
  .limit(1)
  .maybeSingle();

  const isUniqueScan = !existingScan;

  console.log("==================================");
  console.log("SCAN ROUTE HIT");
  console.log("Slug:", slug);
  console.log("IP:", ip);
  console.log("Country:", country);
  console.log("Region:", region);
  console.log("City:", city);
  console.log("Device:", deviceType);
  console.log("Browser:", browser);
  console.log("Unique Scan:", isUniqueScan);
  console.log("==================================");

  /*
  ==========================================
  INSERT ONLY UNIQUE SCANS
  ==========================================
  */

  if (isUniqueScan) {
    const {
      error: scanInsertError
    } = await supabase
      .from("qr_scans")
      .insert({
        slug,
        customer_email: data.customer_email,
        scanned_at: new Date().toISOString(),
        ip_address: ip,
        country,
        region,
        city,
        device_type: deviceType,
        browser,
        is_unique_scan: true,
        scan_source: "QR",
        user_agent: userAgent
      });

    console.log("SCAN INSERT ERROR:", scanInsertError);

    /*
    ==========================================
    UPDATE TOTAL COUNT
    ==========================================
    */

    if (!scanInsertError) {
      const newCount =
        Number(data.scan_count || 0) + 1;

      await supabase
        .from("qr_links")
        .update({
          scan_count: newCount
        })
        .eq("slug", slug);

      console.log("SCAN COUNT UPDATED:", newCount);
    }
  }

  /*
  ==========================================
  SAFE REDIRECT
  ==========================================
  */

  let finalUrl = data.destination_url;

  if (
    !finalUrl.startsWith("http://") &&
    !finalUrl.startsWith("https://")
  ) {
    finalUrl = `https://${finalUrl}`;
  }

  console.log("REDIRECTING TO:", finalUrl);

  return Response.redirect(
    finalUrl,
    302
  );
}