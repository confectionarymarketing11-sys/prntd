/* eslint-disable */
// @ts-nocheck
import crypto from "crypto";
import { json } from "@remix-run/node";
import { createClient } from "@supabase/supabase-js";
import QRCode from "qrcode";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ========================
// 🔧 HELPERS
// ========================
function createSlug(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

export const action = async ({ request }: any) => {
  try {
    const rawBody = await request.text();

    const hmacHeader = request.headers.get(
      "x-shopify-hmac-sha256"
    );

    // ========================
    // 🔐 VERIFY SHOPIFY
    // ========================
    const digest = crypto
      .createHmac(
        "sha256",
        process.env.SHOPIFY_WEBHOOK_SECRET!
      )
      .update(rawBody, "utf8")
      .digest("base64");

    if (digest !== hmacHeader) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    const order = JSON.parse(rawBody);

    const email = order?.email;
    const orderId = order?.id;

    if (!email || !orderId) {
      return json(
        { error: "Invalid order" },
        { status: 400 }
      );
    }

    // ========================
    // 🚫 PREVENT DUPLICATES
    // ========================
    const { data: existingOrder } = await supabase
      .from("bg_orders")
      .select("id")
      .eq("order_id", orderId)
      .maybeSingle();

    if (existingOrder) {
      return json({ ok: true });
    }

    // ========================
    // 💰 BG CREDITS
    // ========================
    let creditsToAdd = 0;

    // ========================
    // 🎨 DESIGN REFERENCES
    // ========================
    const designReferences: string[] = [];

    // ========================
    // 🎯 QR PRODUCT DETECTION
    // ========================
    const DYNAMIC_QR_VARIANT_IDS = [
      48268999917800
    ];

    let shouldCreateQR = false;
    let businessName = "";
    let destinationUrl = "";

    // ========================
    // 🔄 PROCESS LINE ITEMS
    // ========================
    for (const item of order.line_items || []) {

      // ========================
      // 💰 BG CREDIT DETECTION
      // ========================
      if (item.variant_id === 48213453013224)
        creditsToAdd += 25;

      if (item.variant_id === 48213453045992)
        creditsToAdd += 50;

      if (item.variant_id === 48213453078760)
        creditsToAdd += 100;

      // ========================
      // 🧾 ITEM PROPERTIES
      // ========================
      const props = item.properties || [];

      for (const prop of props) {

        // ========================
        // 🎨 DESIGN REFERENCE
        // ========================
        if (
          prop.name === "design_reference"
        ) {

          if (
            prop.value &&
            typeof prop.value === "string"
          ) {
            designReferences.push(
              prop.value
            );
          }

        }

        // ========================
        // 🔗 QR PROPERTIES
        // ========================
        if (
          DYNAMIC_QR_VARIANT_IDS.includes(
            item.variant_id
          )
        ) {

          shouldCreateQR = true;

          if (
            prop.name ===
            "Business Name"
          ) {
            businessName =
              prop.value || "";
          }

          if (
            prop.name ===
            "QR Destination URL"
          ) {
            destinationUrl =
              prop.value || "";
          }

        }

      }

    }

    // ========================
    // 👤 ENSURE BG USER EXISTS
    // ========================
    if (creditsToAdd > 0) {

      const { error: userError } =
        await supabase
          .from("bg_users")
          .upsert(
            { email },
            {
              onConflict: "email",
            }
          );

      if (userError) {
        return new Response(
          "User error",
          {
            status: 500,
          }
        );
      }

      // ========================
      // ➕ ADD BG CREDITS
      // ========================
      const {
        error: updateError,
      } = await supabase.rpc(
        "add_credits",
        {
          user_email: email,
          amount: creditsToAdd,
        }
      );

      if (updateError) {
        return new Response(
          "Credit update failed",
          {
            status: 500,
          }
        );
      }

    }

    // ========================
    // 🔗 CREATE DYNAMIC QR
    // ========================
    if (
      shouldCreateQR &&
      destinationUrl
    ) {

      const baseName =
        businessName || email;

      const slug =
        createSlug(baseName);

      const redirectUrl =
        `https://go.prntd.ca/${slug}`;

      // Save redirect link
      await supabase
        .from("qr_links")
        .upsert(
          {
            slug,
            destination_url:
              destinationUrl,
            active: true,
            customer_name:
              businessName || email,
          },
          {
            onConflict: "slug",
          }
        );

      // Generate QR image
      const qrImageDataUrl =
        await QRCode.toDataURL(
          redirectUrl,
          {
            width: 800,
            margin: 2,
          }
        );

      // Save generated QR
      await supabase
        .from("qr_generated")
        .insert({
          order_id: orderId,
          email,
          slug,
          redirect_url:
            redirectUrl,
          destination_url:
            destinationUrl,
          qr_image_data_url:
            qrImageDataUrl,
        });

    }

    // ========================
    // 🎨 MARK DESIGNS PURCHASED
    // ========================
    for (const designId of designReferences) {

      await supabase
        .from("designs")
        .update({
          status: "completed",
          shopify_order_id: orderId,
          purchased_at:
            new Date().toISOString(),
        })
        .eq("id", designId);

    }

    // ========================
    // 🧾 RECORD BG ORDER
    // ========================
    if (creditsToAdd > 0) {

      const {
        error: orderError,
      } = await supabase
        .from("bg_orders")
        .insert({
          order_id: orderId,
          email,
          credits_added:
            creditsToAdd,
        });

      if (orderError) {
        return new Response(
          "Order insert failed",
          {
            status: 500,
          }
        );
      }

    }

    return json({
      success: true,
    });

  } catch (err) {

    console.error(
      "Webhook error:",
      err
    );

    return new Response(
      "Server error",
      {
        status: 500,
      }
    );

  }
};
