import type { Metadata } from "next";
import Link from "next/link";
import StorefrontAnalyticsTracker from "@/components/StorefrontAnalyticsTracker";
import "./globals.css";

import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL("https://prntd.ca"),

  title: "PRNTD | Custom Apparel, Stickers & Business Cards Canada",

  description:
    "Design and order custom apparel, die-cut stickers, business cards, and print products online with PRNTD.",

  openGraph: {
    title: "PRNTD",
    description:
      "Custom apparel, stickers, business cards and print products.",
    url: "https://prntd.ca",
    siteName: "PRNTD",
    locale: "en_CA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <StorefrontAnalyticsTracker />
        {children}
        <footer className="mt-auto border-t border-white/10 bg-[#020617] px-5 py-8 text-center">
  <div className="mx-auto flex max-w-7xl flex-col items-center gap-3">
    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#64748b]">
      PRNTD PLATFORM
    </p>

    <Link
      href="/policies"
      className="text-sm font-bold text-[#cbd5e1] transition hover:text-white"
    >
      Terms, privacy, refunds, and shipping policies
    </Link>

    <p className="text-xs text-[#64748b]">
      © 2026 PRNTD. All rights reserved.
    </p>
  </div>
</footer>

<Script
  id="tawk-to"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
      (function(){
        var s1=document.createElement("script"),
            s0=document.getElementsByTagName("script")[0];
        s1.async=true;
        s1.src='https://embed.tawk.to/6a1108003768c91c323d8cea/1jp98egah';
        s1.charset='UTF-8';
        s1.setAttribute('crossorigin','*');
        s0.parentNode.insertBefore(s1,s0);
      })();
    `,
  }}
/>

      </body>
    </html>
  );
}