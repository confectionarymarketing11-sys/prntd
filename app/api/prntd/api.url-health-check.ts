import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/*
==========================================
URL HEALTH CHECKER
CRON VERSION
Runs on schedule (daily / weekly)
==========================================
*/

async function checkUrlHealth(targetUrl: string) {
  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      redirect: "manual"
    });

    let health = "active";

    if (response.status >= 300 && response.status < 400) {
      health = "redirecting";
    }

    if (response.status >= 400) {
      health = "broken";
    }

    return {
      url_health: health,
      last_checked_at: new Date().toISOString()
    };
  } catch (error) {
    return {
      url_health: "timeout",
      last_checked_at: new Date().toISOString()
    };
  }
}

export async function loader() {
  try {
    /*
    ==========================================
    GET ALL ACTIVE QR LINKS
    ==========================================
    */

    const { data: qrLinks, error } = await supabase
      .from("qr_links")
      .select(`
        id,
        destination_url,
        active
      `)
      .eq("active", true);

    if (error) {
      console.error("QR fetch error:", error);

      return Response.json(
        {
          success: false,
          error: error.message
        },
        { status: 500 }
      );
    }

    if (!qrLinks || qrLinks.length === 0) {
      return Response.json({
        success: true,
        checked: 0,
        message: "No active QR codes found"
      });
    }

    /*
    ==========================================
    CHECK + UPDATE EACH QR
    ==========================================
    */

    let checkedCount = 0;

    for (const qr of qrLinks) {
      if (!qr.destination_url) {
        continue;
      }

      const result = await checkUrlHealth(
        qr.destination_url
      );

      await supabase
        .from("qr_links")
        .update({
          url_health: result.url_health,
          last_checked_at: result.last_checked_at
        })
        .eq("id", qr.id);

      checkedCount++;

      console.log(
        "Updated:",
        qr.destination_url,
        result.url_health
      );
    }

    /*
    ==========================================
    SUCCESS
    ==========================================
    */

    return Response.json({
      success: true,
      checked: checkedCount,
      message: "URL health check completed"
    });

  } catch (error: any) {
    console.error(
      "URL Health Cron Error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          error.message ||
          "Server error"
      },
      { status: 500 }
    );
  }
}
