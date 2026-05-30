import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms, Privacy, Refund & Shipping Policies | PRNTD",

  description:
    "Review PRNTD's terms of service, privacy policy, refund policy, and shipping information for custom printing, apparel, stickers, business cards, and online orders.",

  keywords: [
    "PRNTD policies",
    "PRNTD terms of service",
    "PRNTD privacy policy",
    "PRNTD refund policy",
    "PRNTD shipping policy",
    "custom printing policies",
    "business card printing terms",
    "DTF printing policy",
    "shipping information",
    "refund information",
  ],

  alternates: {
    canonical: "https://www.prntd.ca/policies",
  },

  openGraph: {
    title: "PRNTD Terms, Privacy, Refund & Shipping Policies",
    description:
      "Read PRNTD's policies regarding terms of service, privacy, refunds, and shipping.",
    url: "https://www.prntd.ca/policies",
    siteName: "PRNTD",
    type: "website",
    images: [
      {
        url: "/og-policies.jpg",
        width: 1200,
        height: 630,
        alt: "PRNTD Policies",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "PRNTD Policies",
    description:
      "Terms of service, privacy policy, refund policy, and shipping information.",
    images: ["/og-policies.jpg"],
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