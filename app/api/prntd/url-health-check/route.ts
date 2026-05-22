import { ApiError, apiJson, withApiErrorHandling, withTimeout } from "@/lib/api-response";
import { getOptionalEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UrlHealth = "active" | "redirecting" | "broken" | "timeout";

function authorizeCron(request: Request) {
  const cronSecret = getOptionalEnv("CRON_SECRET");

  if (!cronSecret) return;

  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    throw new ApiError("Unauthorized", 401, "unauthorized");
  }
}

async function checkUrlHealth(targetUrl: string): Promise<{ url_health: UrlHealth; last_checked_at: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
    });

    let health: UrlHealth = "active";

    if (response.status >= 300 && response.status < 400) {
      health = "redirecting";
    }

    if (response.status >= 400) {
      health = "broken";
    }

    return {
      url_health: health,
      last_checked_at: new Date().toISOString(),
    };
  } catch {
    return {
      url_health: "timeout",
      last_checked_at: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET(request: Request) {
  return withApiErrorHandling(request, async () =>
    withTimeout(
      (async () => {
        authorizeCron(request);

        const supabase = createSupabaseAdminClient();
        const { data: qrLinks, error } = await supabase
          .from("qr_links")
          .select("id, destination_url, active")
          .eq("active", true);

        if (error) {
          throw error;
        }

        if (!qrLinks?.length) {
          return apiJson(request, {
            success: true,
            checked: 0,
            message: "No active QR codes found",
          });
        }

        let checkedCount = 0;

        for (const qr of qrLinks) {
          if (!qr.destination_url) continue;

          const result = await checkUrlHealth(qr.destination_url);

          await supabase
            .from("qr_links")
            .update({
              url_health: result.url_health,
              last_checked_at: result.last_checked_at,
            })
            .eq("id", qr.id);

          checkedCount++;
        }

        return apiJson(request, {
          success: true,
          checked: checkedCount,
          message: "URL health check completed",
        });
      })(),
      60_000
    )
  );
}
