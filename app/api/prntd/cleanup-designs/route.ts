import { ApiError, apiJson, withApiErrorHandling, withTimeout } from "@/lib/api-response";
import { getOptionalEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorizeCron(request: Request) {
  const cronSecret = getOptionalEnv("CRON_SECRET");

  if (!cronSecret) return;

  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    throw new ApiError("Unauthorized", 401, "unauthorized");
  }
}

function storagePathFromPublicUrl(value: string) {
  const marker = "/storage/v1/object/public/uploads/";

  if (value.includes(marker)) {
    return value.split(marker)[1] || value;
  }

  return value;
}

export async function GET(request: Request) {
  return withApiErrorHandling(request, async () =>
    withTimeout(
      (async () => {
        authorizeCron(request);

        const supabase = createSupabaseAdminClient();
        const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

        const { data: designs, error } = await supabase
          .from("designs")
          .select("id, data")
          .eq("status", "pending")
          .eq("data->>type", "shirt-customizer")
          .lt("created_at", cutoff);

        if (error) {
          throw error;
        }

        if (!designs?.length) {
          return apiJson(request, {
            success: true,
            deleted: 0,
          });
        }

        let deletedCount = 0;

        for (const design of designs) {
          const data = (design.data ?? {}) as {
            front_originals?: string[];
            back_originals?: string[];
            front_flattened?: string;
            back_flattened?: string;
          };

          const filesToDelete = [
            ...(data.front_originals ?? []),
            ...(data.back_originals ?? []),
            data.front_flattened,
            data.back_flattened,
          ]
            .filter((value): value is string => Boolean(value))
            .map(storagePathFromPublicUrl);

          if (filesToDelete.length) {
            const { error: storageError } = await supabase.storage.from("uploads").remove(filesToDelete);

            if (storageError) {
              console.error("Storage cleanup error:", storageError.message);
            }
          }

          const { error: deleteError } = await supabase.from("designs").delete().eq("id", design.id);

          if (deleteError) {
            console.error("Design cleanup error:", deleteError.message);
            continue;
          }

          deletedCount++;
        }

        return apiJson(request, {
          success: true,
          deleted: deletedCount,
        });
      })(),
      60_000
    )
  );
}
