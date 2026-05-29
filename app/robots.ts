import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/account/",
        "/cart/",
        "/login/",
        "/signup/",
        "/dashboard/",
        "/my-designs/",
      ],
    },
    sitemap: "https://prntd.ca/sitemap.xml",
  };
}