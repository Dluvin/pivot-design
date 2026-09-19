import type { Metadata } from "next";
import Link from "next/link";
import { DM_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { ScreenBrand } from "@/components/design/PrintBrand";

const sans = DM_Sans({
  variable: "--font-sans-loaded",
  subsets: ["latin"],
});

const serif = Source_Serif_4({
  variable: "--font-serif-loaded",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pivot Design",
  description: "Center pivot and linear design calculators",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} min-h-full antialiased`}>
        <header className="no-print border-b border-emerald-950/20 bg-emerald-950 text-emerald-50">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="font-display text-lg tracking-tight">
              Pivot Design
            </Link>
            <ScreenBrand />
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 print:max-w-none print:px-0 print:py-0">{children}</main>
      </body>
    </html>
  );
}
