import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { lato, playfair } from "@/lib/fonts";

// Define your production URL here
const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ayoob Bakery Australia | Premium Artisan Breads",
    template: "%s | Ayoob Bakery"
  },
  description: "Premium Artisan Breads & Pastries. Handcrafted daily using organic flour, natural yeast, and patience. Experience the warmth of fresh baking in every bite.",
  keywords: ["Bakery", "Artisan Bread", "Sourdough", "Pastries", "Australia", "Organic"],
  authors: [{ name: "Ayoob Bakery" }],
  creator: "Ayoob Bakery",
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: siteUrl,
    siteName: "Ayoob Bakery Australia",
    title: "Ayoob Bakery Australia | Premium Artisan Breads",
    description: "Handcrafted daily using organic flour and natural yeast. Experience the warmth of fresh baking.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Freshly baked artisan bread at Ayoob Bakery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ayoob Bakery Australia",
    description: "Premium Artisan Breads & Pastries.",
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
  // FIX: Updated to point to the file you placed in the app folder
  // Since it is in 'app/favicon.ico', the public URL is just '/favicon.ico'
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lato.variable} ${playfair.variable}`}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={lato.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}