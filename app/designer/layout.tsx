import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://prntd.ca"),

  title:
    "Custom T-Shirt Designer Canada | Design & Print Shirts Online | PRNTD",

  description:
    "Create custom t-shirts online with premium DTF printing. Upload artwork, add text, customize apparel, and order high-quality printed shirts in Canada.",

  openGraph: {
    title:
      "Custom T-Shirt Designer Canada | Design & Print Shirts Online | PRNTD",
    description:
      "Design custom t-shirts online with premium printing and fast Canadian fulfillment.",
    url: "https://prntd.ca/designer",
    siteName: "PRNTD",
    locale: "en_CA",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title:
      "Custom T-Shirt Designer Canada | Design & Print Shirts Online | PRNTD",
    description:
      "Upload artwork, customize apparel, and order premium custom t-shirts online.",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}