"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/admin/data/auth";
import { updateSiteSettings } from "@/features/site-settings/data/site-settings";
import { updateShippingRatesFromFormData } from "@/features/shipping/actions/shipping";

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

function lines(formData: FormData, key: string) {
  return value(formData, key)
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
}

export async function updateSiteSettingsAction(formData: FormData) {
  await requireAdmin();

  await updateSiteSettings({
    test_mode_enabled: formData.get("test_mode_enabled") === "on",
    test_mode_notice: value(formData, "test_mode_notice") || "Test mode is enabled. Orders and checkout flows are for testing only.",
    announcement_enabled: formData.get("announcement_enabled") === "on",
    announcement_text: value(formData, "announcement_text"),
    announcement_link: value(formData, "announcement_link") || null,
    logo_text: value(formData, "logo_text") || "PRNTD",
    logo_subtitle: value(formData, "logo_subtitle") || "Custom print shop",
    logo_image_url: value(formData, "logo_image_url") || null,
    contact_email: value(formData, "contact_email") || "hello@prntd.ca",
    contact_phone: value(formData, "contact_phone") || null,
    contact_address: value(formData, "contact_address") || null,
    contact_hours: value(formData, "contact_hours") || null,
    contact_body: value(formData, "contact_body") || null,
    terms_body: value(formData, "terms_body") || null,
    privacy_body: value(formData, "privacy_body") || null,
    refund_body: value(formData, "refund_body") || null,
    shipping_body: value(formData, "shipping_body") || null,
    default_currency: value(formData, "default_currency") || "CAD",
    supported_currencies: lines(formData, "supported_currencies"),
    supported_languages: value(formData, "supported_languages")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  });

  await updateShippingRatesFromFormData(formData);

  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/policies");
  revalidatePath("/admin/settings");
  revalidatePath("/cart");
}
