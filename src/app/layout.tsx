import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import { fraunces, instrumentSans } from "@/lib/fonts";
import { SITE_URL as siteUrl } from "@/lib/site";
import RouteProgressBar from "@/components/effects/RouteProgressBar";

/* SEO-2 — search-engine ownership verification (meta-tag method).
   The env vars hold the CONTENT of each verification tag (the long
   token inside content="..."), not the full element. Absent vars →
   the tags simply don't render — nothing breaks locally.
   NEXT_PUBLIC_ vars are inlined at BUILD time: set them on Vercel,
   then redeploy, then click Verify in each console. */
const verification: Metadata["verification"] = {};
if (process.env.NEXT_PUBLIC_GSC_VERIFICATION) {
  verification.google = process.env.NEXT_PUBLIC_GSC_VERIFICATION;
}
if (process.env.NEXT_PUBLIC_BING_VERIFICATION) {
  verification.other = { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION };
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ayoob Bakery — Artisan Bakery in Dandenong North, Melbourne",
    template: "%s | Ayoob Bakery Melbourne",
  },
  description:
    "Ayoob Bakery Melbourne — stone-baked sourdough, Afghan naan, butter croissants and more, fresh from Dandenong North every morning.",
  keywords: [
    "bakery Melbourne",
    "artisan bakery Dandenong North",
    "sourdough Melbourne",
    "Afghan naan",
    "croissants Dandenong North",
    "Ayoob Bakery",
    "bakery Dandenong",
    "patisserie Melbourne",
  ],
  authors: [{ name: "Ayoob Bakery" }],
  creator: "Ayoob Bakery",
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: siteUrl,
    siteName: "Ayoob Bakery Melbourne",
    title: "Ayoob Bakery — Artisan Bakery in Dandenong North, Melbourne",
    description:
      "Stone-baked sourdough, Afghan naan, butter croissants — fresh from Dandenong North every morning.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Freshly baked artisan bread at Ayoob Bakery Melbourne",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ayoob Bakery Melbourne",
    description:
      "Stone-baked sourdough, Afghan naan, butter croissants — fresh from Dandenong North every morning.",
    images: ["/images/og-image.jpg"],
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
  verification,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/logo.png", sizes: "192x192", type: "image/png" },
      { url: "/images/logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/images/logo.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F1E5",
};

/* Boot script — runs before first paint:
   1. adds html.js (gates the reveal system; crawlers/no-JS always see content)
   2. safety net: forces body.loaded after 3.5s (page can never stay curtained)
   3. safety net: removes html.js after 3s if the reveal observer never mounted */
const bootScript = `document.documentElement.classList.add('js');setTimeout(function(){document.body.classList.add('loaded')},3500);setTimeout(function(){if(!window.__ayoobReveal){document.documentElement.classList.remove('js')}},3000);`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrumentSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        {/* PHASE 5: Font Awesome no longer loads site-wide. Only the
            legacy-styled pages that still render fa-* icons load it
            themselves via <FontAwesome /> (admin, admin login, blogs,
            blog detail, profile, error page). Every redesigned page now
            paints without that render-blocking stylesheet. */}
      </head>
      <body suppressHydrationWarning>
      {/* navigation feedback — appears only when a page transition is slow */}
      <RouteProgressBar />
      <Providers>{children}</Providers>
    </body>
    </html>
  );
}