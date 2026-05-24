"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackStorefrontEvent } from "@/lib/storefront-analytics";

export default function StorefrontAnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (pathname?.startsWith("/api")) return;

    trackStorefrontEvent("page_view");
  }, [pathname]);

  return null;
}
