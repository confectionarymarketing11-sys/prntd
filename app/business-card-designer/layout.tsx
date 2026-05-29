import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Custom Business Card Designer Canada | Design Business Cards Online | PRNTD",
  description:
    "Create professional business cards online. Upload artwork, add text, generate QR codes, customize layouts, and order premium business cards from PRNTD.",
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}