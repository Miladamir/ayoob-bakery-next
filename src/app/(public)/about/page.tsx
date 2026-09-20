import type { Metadata } from "next";
import About from "@/components/about/About";
import ArtDefs from "@/components/about/ArtDefs";
import { SITE_URL as siteUrl, BUSINESS_NAME, PHONE_TEL, SOCIAL_PROFILES } from "@/lib/site";
import "./about.css";

/* ISR (restored — it was dropped from this file during the UI pass) */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Our Story — About",
  description:
    "The story of Ayoob Bakery Melbourne — first founded in 1952, newly reopened at 4 Stevenson Ave, Dandenong North. Afghan by heritage, Melbourne by heart.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Our Story — About | Ayoob Bakery Melbourne",
    description:
      "First founded in 1952, newly reopened in Dandenong North — Afghan by heritage, Melbourne by heart.",
    type: "website",
  },
};

export default async function AboutPage() {
  const yearsBaking = new Date().getFullYear() - 1952;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Our Story — Ayoob Bakery Melbourne",
    description:
      "First founded in 1952, newly reopened in Dandenong North — Afghan by heritage, Melbourne by heart.",
    url: `${siteUrl}/about`,
    mainEntity: {
      "@type": "Bakery",
      name: BUSINESS_NAME,
      foundingDate: "1952",
      telephone: PHONE_TEL,
      email: "sales@ayoobbakerymelbourne.com.au",
      sameAs: SOCIAL_PROFILES,
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
      <About yearsBaking={yearsBaking} />
    </>
  );
}