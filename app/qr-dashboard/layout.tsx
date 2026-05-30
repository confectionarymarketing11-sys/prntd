import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Manager | Dynamic QR Codes & Analytics | PRNTD",
  description:
    "Create dynamic QR codes, branded short links, editable redirects, and track scans with real-time analytics. Generate free static QR codes or manage smart QR campaigns with PRNTD.",

  keywords: [
    "QR code generator",
    "dynamic QR codes",
    "QR analytics",
    "smart QR codes",
    "QR code tracking",
    "editable QR codes",
    "branded short links",
    "QR campaign manager",
    "free QR code generator",
    "marketing QR codes",
    "QR dashboard",
    "PRNTD QR Manager",
  ],

  openGraph: {
    title: "QR Manager | Dynamic QR Codes & Analytics",
    description:
      "Create, manage, and track dynamic QR codes with analytics, branded links, and editable destinations.",
    url: "https://www.prntd.ca/qr-dashboard",
    siteName: "PRNTD",
    type: "website",
    images: [
      {
        url: "/og-qr-manager.jpg",
        width: 1200,
        height: 630,
        alt: "PRNTD QR Manager Dashboard",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "QR Manager | Dynamic QR Codes & Analytics",
    description:
      "Create dynamic QR codes, track scans, and manage branded short links with PRNTD.",
    images: ["/og-qr-manager.jpg"],
  },

  alternates: {
    canonical: "https://www.prntd.ca/qr-dashboard",
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