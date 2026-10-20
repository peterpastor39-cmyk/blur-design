import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const aspekta = localFont({ src: "../public/fonts/AspektaVF.woff2", weight: "100 900", style: "normal", variable: "--font-aspekta", display: "swap" });

export const metadata: Metadata = {
  title: "Blur",
  description: "Every idea starts with something.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={aspekta.variable}>
      <body>{children}</body>
    </html>
  );
}
