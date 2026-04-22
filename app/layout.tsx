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
  metadataBase: new URL("https://inlookdeals.com"),
  title: {
    default: "Inlook — Creator marketplace with verified engagement",
    template: "%s · Inlook",
  },
  description:
    "Inlook is a creator marketplace connecting small brands with verified YouTube creators. Real engagement data, transparent pricing, no agency markup.",
  keywords: [
    "creator marketplace",
    "influencer marketplace",
    "UGC creators",
    "YouTube creator platform",
    "brand sponsorship platform",
    "verified engagement",
    "influencer platform for small brands",
    "creator economy",
    "sponsored content platform",
    "Inlook",
  ],
  authors: [{ name: "Inlook" }],
  creator: "Inlook",
  publisher: "Inlook",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://inlookdeals.com",
    title: "Inlook — Creator marketplace with verified engagement",
    description:
      "Connect with verified YouTube creators. Real engagement data, transparent pricing, no agency markup.",
    siteName: "Inlook",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Inlook — Creator marketplace with verified engagement",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inlook — Creator marketplace with verified engagement",
    description:
      "Connect with verified YouTube creators. Real engagement data, transparent pricing, no agency markup.",
    images: ["/og-image.png"],
    creator: "@inlook_startup",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://inlookdeals.com/#organization",
      name: "Inlook",
      url: "https://inlookdeals.com",
      logo: "https://inlookdeals.com/icon.svg",
      email: "support@inlookdeals.com",
      description:
        "Creator marketplace connecting small brands with verified YouTube creators. Verified engagement data, transparent pricing, no agency markup.",
      sameAs: [
        "https://www.instagram.com/tryinlook",
        "https://www.tiktok.com/@tryinlook",
        "https://x.com/inlook_startup",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://inlookdeals.com/#website",
      url: "https://inlookdeals.com",
      name: "Inlook",
      publisher: { "@id": "https://inlookdeals.com/#organization" },
      inLanguage: "en-US",
    },
    {
      "@type": "SoftwareApplication",
      name: "Inlook",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "A creator marketplace connecting small brands with verified YouTube creators for sponsored content deals. Brands browse creators with real engagement data; creators list their rate once. 15% platform fee deducted via Stripe Connect.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free to join for both brands and creators",
      },
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
