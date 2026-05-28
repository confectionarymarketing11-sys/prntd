import { DesignLayer, Order } from "@/data/shop";
import { createSupabaseAdminClient } from "@/lib/supabase/service";

const MAX_PRINT_ASSET_BYTES =
  10 * 1024 * 1024;

const ALLOWED_PRINT_ASSET_TYPES =
  new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
  ]);

function dataUrlToUpload(
  dataUrl: string,
) {
  const match = dataUrl.match(
    /^data:([-+\w.]+\/[-+\w.]+);base64,(.+)$/,
  );

  if (!match?.[2]) return null;

  const mimeType = (
    match[1] || "image/png"
  ).toLowerCase();

  if (
    !ALLOWED_PRINT_ASSET_TYPES.has(
      mimeType,
    )
  ) {
    return null;
  }

  const buffer = Buffer.from(
    match[2],
    "base64",
  );

  if (
    buffer.length >
    MAX_PRINT_ASSET_BYTES
  ) {
    return null;
  }

  const extension =
    mimeType.includes("jpeg")
      ? "jpg"
      : mimeType.split("/")[1] ||
        "png";

  return {
    buffer,
    mimeType,
    extension,
  };
}

export async function uploadPrintAsset({
  orderId,
  itemId,
  productId,
  side,
  role,
  dataUrl,
  placement,
}: {
  orderId: string;
  itemId: string;
  productId: string;
  side: "front" | "back";
  role:
    | "print_area"
    | "placement_reference"
    | "source_layer";
  dataUrl?: string | null;
  placement: Record<
    string,
    unknown
  >;
}) {
  if (
    !dataUrl?.startsWith(
      "data:image/",
    )
  ) {
    return null;
  }

  const upload =
    dataUrlToUpload(dataUrl);

  if (!upload) return null;

  const supabase =
    createSupabaseAdminClient();

  const fileName = `${role}-${side}-${crypto.randomUUID()}.${
    upload.extension
  }`;

  const path = `checkout/${orderId}/${itemId}/${fileName}`;

  const {
    error: storageError,
  } = await supabase.storage
    .from("uploads")
    .upload(
      path,
      upload.buffer,
      {
        contentType:
          upload.mimeType,
        upsert: true,
      },
    );

  if (storageError) {
    console.warn(
      "Print asset upload failed:",
      storageError.message,
    );

    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("uploads")
    .getPublicUrl(path);

  const { data, error } =
    await supabase
      .from("uploads")
      .insert({
        file_name: fileName,
        file_url: publicUrl,
        preview_url: publicUrl,
        mime_type:
          upload.mimeType,
        file_size:
          upload.buffer.length,
        upload_status:
          "uploaded",
        print_side: side,
        asset_role: role,
        placement: {
          order_client_id:
            orderId,
          cart_item_id: itemId,
          product_id:
            productId,
          ...placement,
        },
      })
      .select("id")
      .single<{ id: string }>();

  if (error) {
    if (
      error.code !== "42703"
    ) {
      console.warn(
        "Print asset database insert failed:",
        error.message,
      );

      return null;
    }

    const {
      data: legacyData,
      error: legacyError,
    } = await supabase
      .from("uploads")
      .insert({
        file_name: fileName,
        file_url: publicUrl,
        preview_url: publicUrl,
        mime_type:
          upload.mimeType,
        file_size:
          upload.buffer.length,
        upload_status:
          "uploaded",
      })
      .select("id")
      .single<{ id: string }>();

    if (legacyError) {
      console.warn(
        "Legacy print asset database insert failed:",
        legacyError.message,
      );

      return null;
    }

    return (
      legacyData?.id ?? null
    );
  }

  return data?.id ?? null;
}

export async function uploadOrderPrintAssets(
  order: Order,
) {
  const uploadResults =
    await Promise.all(
      order.items.flatMap(
        (item) => {
          const printAssets = [
            {
              side:
                "front" as const,
              role:
                "print_area" as const,
              dataUrl:
                item.frontPreview,
            },
            {
              side:
                "back" as const,
              role:
                "print_area" as const,
              dataUrl:
                item.backPreview,
            },
            {
              side:
                "front" as const,
              role:
                "placement_reference" as const,
              dataUrl:
                item.frontPlacementPreview,
            },
            {
              side:
                "back" as const,
              role:
                "placement_reference" as const,
              dataUrl:
                item.backPlacementPreview,
            },
          ];

          const printUploads =
            printAssets.map(
              (asset) =>
                uploadPrintAsset(
                  {
                    orderId:
                      order.id,
                    itemId:
                      item.id,
                    productId:
                      item.productId,
                    side:
                      asset.side,
                    role:
                      asset.role,
                    dataUrl:
                      asset.dataUrl,
                    placement:
                      {
                        description:
                          asset.role ===
                          "placement_reference"
                            ? "Clipped artwork on clipping-area template"
                            : "Clipped artwork for printing",
                        safe_zone_inset_px:
                          20,
                      },
                  },
                ),
            );

          const sourceLayerUploads =
            [
              {
                side:
                  "front" as const,
                layers:
                  item.frontLayers,
              },
              {
                side:
                  "back" as const,
                layers:
                  item.backLayers,
              },
            ].flatMap(
              (group) =>
                group.layers
                  .filter(
                    (
                      layer,
                    ) =>
                      layer.type ===
                      "image",
                  )
                  .map(
                    (
                      layer,
                    ) =>
                      uploadPrintAsset(
                        {
                          orderId:
                            order.id,
                          itemId:
                            item.id,
                          productId:
                            item.productId,
                          side:
                            group.side,
                          role:
                            "source_layer",
                          dataUrl:
                            layer.originalPreview ||
                            layer.preview,
                          placement:
                            {
                              layer_id:
                                layer.id,
                              x: layer.x,
                              y: layer.y,
                              width:
                                layer.width ??
                                null,
                              height:
                                layer.height ??
                                null,
                              rotation:
                                layer.rotation,
                            },
                        },
                      ),
                  ),
            );

          return [
            ...printUploads,
            ...sourceLayerUploads,
          ];
        },
      ),
    );

  return uploadResults.filter(
    Boolean,
  ) as string[];
}