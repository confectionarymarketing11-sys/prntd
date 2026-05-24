import type { Metadata } from "next";
import Link from "next/link";
import StorefrontAnalyticsTracker from "@/components/StorefrontAnalyticsTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRNTD Print Shop",
  description: "Custom print storefront, designer, checkout, and order desk.",
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
        <footer className="mt-auto border-t border-slate-200 bg-white px-5 py-6 text-center text-sm text-slate-500">
          <Link href="/policies" className="font-bold text-slate-800 hover:underline">
            Terms, privacy, refunds, and shipping policies
          </Link>
        </footer>
      </body>
    </html>
  );
}
