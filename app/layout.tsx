import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Providers } from "./providers";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz"],
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Inlook — Creators who convert, priced honestly",
  description:
    "A brand-influencer marketplace with verified engagement data, transparent pricing, and AI-matched creators. Built by founders, for founders.",
  openGraph: {
    title: "Inlook — Creators who convert, priced honestly",
    description:
      "A brand-influencer marketplace with verified engagement data, transparent pricing, and AI-matched creators.",
    siteName: "Inlook",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="min-h-dvh antialiased">
        <div className="relative min-h-dvh overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[560px] opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(74,144,255,0.14), transparent 60%)",
            }}
          />
          <Providers>
            <Nav />
            <main>{children}</main>
            <Footer />
          </Providers>
        </div>
      </body>
    </html>
  );
}
