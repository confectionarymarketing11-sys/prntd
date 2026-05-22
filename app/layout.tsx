import type { Metadata } from "next";
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
