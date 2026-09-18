import type { Metadata } from "next";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import About from "@/components/about/About";
import ArtDefs from "@/components/about/ArtDefs";
import { SITE_URL as siteUrl } from "@/lib/site";
import "./about.css";

/* ISR: prerendered, re-validated every 5 minutes */
export const revalidate = 300;

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

const FIELDS = "name price images unit discount";
const effPrice = (p: any): number =>
  p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;

export default async function AboutPage() {
  await dbConnect();

  /* the tandoor CTA features a REAL bake:
     a naan if we have one → else a bestseller → else anything */
  let pick: any = await Product.findOne({
    name: { $regex: "naan", $options: "i" },
  })
    .select(FIELDS)
    .lean();
  const isNaan = !!pick;

  if (!pick) {
    pick = await Product.findOne({ badge: "Bestseller" }).select(FIELDS).lean();
  }
  if (!pick) {
    pick = await Product.findOne({}).sort({ createdAt: -1 }).select(FIELDS).lean();
  }

  const tandoorPick = pick
    ? {
        _id: String(pick._id),
        name: pick.name,
        price: +effPrice(pick).toFixed(2),
        image: pick.images?.[0] || null,
        unit: pick.unit,
      }
    : null;

  /* "years on Lygon St" — always current, computed on the server */
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
        streetAddress: "312 Lygon Street",
        addressLocality: "Brunswick",
        addressRegion: "VIC",
        postalCode: "3056",
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
      <About tandoorPick={tandoorPick} isNaan={isNaan} yearsOnLygon={yearsOnLygon} />
    </>
  );
}