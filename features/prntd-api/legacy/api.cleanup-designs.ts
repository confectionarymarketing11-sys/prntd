/* eslint-disable */
// @ts-nocheck
import { json } from "@remix-run/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function loader() {

  try {

    // =========================
    // 48 HOUR CUTOFF
    // =========================

    const cutoff = new Date(
      Date.now() - 48 * 60 * 60 * 1000
    ).toISOString();

    // =========================
    // FIND OLD PENDING
    // SHIRT CUSTOMIZER DESIGNS
    // =========================

    const {
      data: designs,
      error
    } = await supabase
      .from("designs")
      .select("*")
      .eq("status", "pending")
      .eq(
        "data->>type",
        "shirt-customizer"
      )
      .lt(
        "created_at",
        cutoff
      );

    if (error) {

      console.error(
        "QUERY ERROR:",
        error
      );

      return json({
        success: false,
        error: error.message
      });

    }

    // =========================
    // NOTHING TO DELETE
    // =========================

    if (!designs?.length) {

      return json({
        success: true,
        deleted: 0
      });

    }

    let deletedCount = 0;

    // =========================
    // DELETE FILES + ROWS
    // =========================

    for (const design of designs) {

      try {

        const data =
          design.data || {};

        const filesToDelete = [

          ...(data.front_originals || []),

          ...(data.back_originals || []),

          data.front_flattened,

          data.back_flattened

        ].filter(Boolean);

        // =========================
        // DELETE STORAGE FILES
        // =========================

        for (const filePath of filesToDelete) {

          try {

            // Remove full URL if needed
            let cleanPath =
              filePath;

            if (
              cleanPath.includes(
                "/storage/v1/object/public/uploads/"
              )
            ) {

              cleanPath =
                cleanPath.split(
                  "/storage/v1/object/public/uploads/"
                )[1];

            }

            await supabase
              .storage
              .from("uploads")
              .remove([
                cleanPath
              ]);

            console.log(
              `Deleted file: ${cleanPath}`
            );

          } catch (storageError) {

            console.error(
              "STORAGE DELETE ERROR:",
              storageError
            );

          }

        }

        // =========================
        // DELETE DATABASE ROW
        // =========================

        await supabase
          .from("designs")
          .delete()
          .eq("id", design.id);

        deletedCount++;

        console.log(
          `Deleted design: ${design.id}`
        );

      } catch (deleteError) {

        console.error(
          "DELETE ERROR:",
          deleteError
        );

      }

    }

    return json({

      success: true,

      deleted: deletedCount

    });

  } catch (err) {

    console.error(
      "CLEANUP ROUTE ERROR:",
      err
    );

    return json({

      success: false

    });

  }

}
