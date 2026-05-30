import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact PRNTD | Custom Printing, Apparel & Business Cards",
  description:
    "Contact PRNTD for custom apparel printing, DTF transfers, business cards, stickers, branded merchandise, QR campaigns, and premium print services.",

  keywords: [
    "contact PRNTD",
    "custom printing Canada",
    "DTF printing",
    "business cards",
    "custom stickers",
    "custom apparel",
    "branded merchandise",
    "print shop Canada",
    "custom t-shirts",
    "printing services",
    "QR code printing",
    "North Bay printing",
  ],

  alternates: {
    canonical: "https://www.prntd.ca/contact",
  },

  openGraph: {
    title: "Contact PRNTD",
    description:
      "Get in touch with PRNTD for custom apparel, business cards, stickers, branding, and premium print solutions.",
    url: "https://www.prntd.ca/contact",
    siteName: "PRNTD",
    type: "website",
    images: [
      {
        url: "/og-contact.jpg",
        width: 1200,
        height: 630,
        alt: "Contact PRNTD",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Contact PRNTD",
    description:
      "Contact PRNTD for custom printing, apparel, stickers, branding, and business cards.",
    images: ["/og-contact.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}