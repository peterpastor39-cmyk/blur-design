import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const aspekta = localFont({ src: "../public/fonts/AspektaVF.woff2", weight: "100 900", style: "normal", variable: "--font-aspekta", display: "swap" });

export const metadata: Metadata = {
  title: "Blur — Independent brand & product design studio",
  description: "An independent design studio for tech, fintech, and Web3 teams. Brand and product design, with a reason behind every decision.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={aspekta.variable}>
      <body>{children}<script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async /></body>
    </html>
  );
}
