import type { Metadata } from "next";
import About from "@/components/about/About";
import ArtDefs from "@/components/about/ArtDefs";
import { SITE_URL as siteUrl } from "@/lib/site";
import "./about.css";

export const metadata: Metadata = {
  title: "Our Story — About",
  description:
    "The story of Ayoob Bakery — one stone oven on Lygon Street since 1996, Afghan by heritage, Brunswick by heart.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Our Story — About | Ayoob Bakery Melbourne",
    description:
      "One stone oven on Lygon Street since 1996, Afghan by heritage, Brunswick by heart.",
    type: "website",
  },
};

export default async function AboutPage() {
  const yearsOnLygon = new Date().getFullYear() - 1996;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Our Story — Ayoob Bakery Melbourne",
    description:
      "One stone oven on Lygon Street since 1996, Afghan by heritage, Brunswick by heart.",
    url: `${siteUrl}/about`,
    mainEntity: {
      "@type": "Bakery",
      name: "Ayoob Bakery",
      foundingDate: "1996",
      telephone: "+61393872196",
      email: "hello@ayoobbakery.com.au",
      address: {
        "@type": "PostalAddress",
        streetAddress: "4 Stevenson Ave",
        addressLocality: "Dandenong North",
        addressRegion: "VIC",
        postalCode: "3175",
        addressCountry: "AU",
      },
    },
  };

  return (
    <>
      <ArtDefs />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <About yearsOnLygon={yearsOnLygon} />
    </>
  );
}