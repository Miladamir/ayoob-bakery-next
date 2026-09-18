import type { Metadata } from "next";
import Contact from "@/components/contact/Contact";
import { SITE_URL } from "@/lib/site";
import "./contact.css";

export const metadata: Metadata = {
  title: "Contact — Talk to the Counter",
  description:
    "Contact Ayoob Bakery — call the counter on (03) 9387 2196, email us, or find us at 4 Stevenson Ave, Dandenong North.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact — Talk to the Counter | Ayoob Bakery Melbourne",
    description:
      "Call the counter on (03) 9387 2196, email us, or find us at 4 Stevenson Ave, Dandenong North.",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact — Ayoob Bakery Melbourne",
  url: `${SITE_URL}/contact`,
  mainEntity: {
    "@type": "Bakery",
    name: "Ayoob Bakery",
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
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+61393872196",
        contactType: "customer service",
        areaServed: "AU",
        availableLanguage: ["English"],
      },
    ],
  },
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Contact />
    </>
  );
}