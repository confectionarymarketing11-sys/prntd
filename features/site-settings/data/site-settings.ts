import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SiteSettings } from "@/features/site-settings/types";

export const defaultSiteSettings: SiteSettings = {
  test_mode_enabled: false,
  test_mode_notice: "Test mode is enabled. Orders and checkout flows are for testing only.",
  announcement_enabled: true,
  announcement_text: "Free design tools and secure checkout are live.",
  announcement_link: null,
  logo_text: "PRNTD",
  logo_subtitle: "Custom print shop",
  logo_image_url: null,
  contact_email: "hello@prntd.ca",
  contact_phone: null,
  contact_address: null,
  contact_hours: null,
  contact_body: "Questions about an order, artwork, or a custom print project? Send us a message and we will get back to you.",
  terms_body: "Terms will be maintained here before launch.",
  privacy_body: "Privacy policy will be maintained here before launch.",
  refund_body: "Refund policy will be maintained here before launch.",
  shipping_body: "Shipping policy will be maintained here before launch.",
  default_currency: "CAD",
  supported_currencies: ["CAD", "USD"],
  supported_languages: ["en", "fr"],
};

export async function getSiteSettings() {
  const supabase = createSupabaseAdminClient();
  const forcedTestMode = process.env.PRNTD_TEST_MODE === "true" || process.env.NEXT_PUBLIC_PRNTD_TEST_MODE === "true";
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("singleton_key", "global")
    .maybeSingle<SiteSettings>();

  if (error?.code === "42P01") {
    return {
      ...defaultSiteSettings,
      test_mode_enabled: forcedTestMode || defaultSiteSettings.test_mode_enabled,
    };
  }
  if (error) throw new Error(error.message);

  const settings = {
    ...defaultSiteSettings,
    ...(data ?? {}),
  };

  return {
    ...settings,
    test_mode_enabled: forcedTestMode || settings.test_mode_enabled,
  };
}

export async function updateSiteSettings(input: Partial<SiteSettings>) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("site_settings").upsert(
    {
      singleton_key: "global",
      ...input,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "singleton_key" }
  );

  if (error) throw new Error(error.message);
}
