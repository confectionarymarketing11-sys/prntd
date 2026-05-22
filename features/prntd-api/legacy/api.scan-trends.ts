/* eslint-disable */
// @ts-nocheck
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/*
==========================================
SCAN TRENDS
CURRENT MONTH ONLY
GROUPED BY DAY
/api/scan-trends?email=
==========================================
*/

export async function loader({
  request
}: any) {
  try {
    const url = new URL(
      request.url
    );

    const email =
      url.searchParams.get(
        "email"
      );

    if (!email) {
      return Response.json(
        {
          success: false,
          error:
            "Missing email"
        },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin":
              "*",
            "Access-Control-Allow-Headers":
              "Content-Type"
          }
        }
      );
    }

    /*
    ==========================================
    CURRENT MONTH RANGE
    ==========================================
    */

    const now = new Date();

    const startOfMonth =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

    const endOfMonth =
      new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      );

    /*
    ==========================================
    GET SCANS
    ==========================================
    */

    const {
      data: scans,
      error
    } = await supabase
      .from("qr_scans")
      .select(`
        scanned_at
      `)
      .eq(
        "customer_email",
        email
      )
      .gte(
        "scanned_at",
        startOfMonth.toISOString()
      )
      .lte(
        "scanned_at",
        endOfMonth.toISOString()
      )
      .order(
        "scanned_at",
        {
          ascending: true
        }
      );

    if (error) {
      console.error(
        "Scan Trends Error:",
        error
      );

      return Response.json(
        {
          success: false,
          error:
            error.message
        },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin":
              "*",
            "Access-Control-Allow-Headers":
              "Content-Type"
          }
        }
      );
    }

    /*
    ==========================================
    GROUP BY DAY
    ==========================================
    */

    const dayMap: Record<
      string,
      number
    > = {};

    scans?.forEach(
      (scan) => {
        if (!scan.scanned_at)
          return;

        const date =
          new Date(
            scan.scanned_at
          )
            .toISOString()
            .split("T")[0];

        dayMap[date] =
          (dayMap[date] || 0) + 1;
      }
    );

    /*
    ==========================================
    FILL EMPTY DAYS
    ==========================================
    */

    const result = [];

    const totalDays =
      endOfMonth.getDate();

    for (
      let day = 1;
      day <= totalDays;
      day++
    ) {
      const currentDate =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          day
        )
          .toISOString()
          .split("T")[0];

      result.push({
        date: currentDate,
        scans:
          dayMap[
            currentDate
          ] || 0
      });
    }

    /*
    ==========================================
    SUCCESS
    ==========================================
    */

    return Response.json(
      {
        success: true,
        month:
          now.toLocaleString(
            "default",
            {
              month: "long"
            }
          ),
        year:
          now.getFullYear(),
        trends: result
      },
      {
        headers: {
          "Access-Control-Allow-Origin":
            "*",
          "Access-Control-Allow-Headers":
            "Content-Type"
        }
      }
    );

  } catch (error: any) {
    console.error(
      "Scan Trends Fatal Error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          error.message ||
          "Server error"
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin":
            "*",
          "Access-Control-Allow-Headers":
            "Content-Type"
        }
      }
    );
  }
}