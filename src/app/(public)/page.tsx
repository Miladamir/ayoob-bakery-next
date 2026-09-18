import { Suspense } from "react";
import type { Metadata } from "next";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Preloader from "@/components/effects/Preloader";
import Hero from "@/components/home/Hero";
import ProductTabs from "@/components/home/ProductTabs";
import Reviews from "@/components/home/Reviews";
import Faqs from "@/components/home/Faqs";
import ContactSection from "@/components/home/ContactSection";
import { stripHtml } from "@/lib/format";
import { SITE_URL as siteUrl } from "@/lib/site";
import "./home.css";

/* ISR: the homepage is prerendered and re-validated every 5 minutes.
   Admin actions already call revalidatePath('/'), so edits appear instantly. */
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/* Local SEO — Bakery structured data (verify the geo coordinates) */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Bakery",
  name: "Ayoob Bakery",
  description:
    "Stone-baked sourdough, Afghan naan, butter croissants and more, fresh from Brunswick every morning.",
  url: siteUrl,
  image: `${siteUrl}/images/og-image.jpg`,
  telephone: "+61393872196",
  email: "hello@ayoobbakery.com.au",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "312 Lygon Street",
    addressLocality: "Brunswick",
    addressRegion: "VIC",
    postalCode: "3056",
    addressCountry: "AU",
  },
  geo: { "@type": "GeoCoordinates", latitude: -37.7713, longitude: 144.9614 },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "06:30", closes: "16:00",
    },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "06:30", closes: "15:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "07:00", closes: "14:00" },
  ],
};

/* Server loader — real products by badge, only the fields the card needs */
const FIELDS = "name price images unit discount badge shortDescription description";

/* PAYLOAD DIET (Phase 3): a ProductCard renders ONE image and a
   ~110-char blurb. Ship exactly that — full descriptions and every
   gallery image used to ride along in the RSC payload. The blurb is
   computed here with the same fallback the card used, so the visuals
   are byte-identical. */
const trimForCard = (list: any[]): any[] =>
  list.map((p) => ({
    _id: String(p._id),
    name: p.name,
    price: p.price,
    images: p.images?.slice(0, 1) ?? [],
    unit: p.unit,
    discount: p.discount ?? 0,
    badge: p.badge ?? "",
    shortDescription:
      p.shortDescription || stripHtml(p.description || "").slice(0, 110),
  }));

async function ProductTabsLoader() {
  await dbConnect();
  const [bestSelling, popular, newArrivals, featured] = await Promise.all([
    Product.find({ badge: "Bestseller" }).select(FIELDS).limit(4).lean(),
    Product.find({ badge: "Popular" }).select(FIELDS).limit(4).lean(),
    Product.find({ badge: "New" }).select(FIELDS).limit(4).lean(),
    Product.find({ badge: "Featured" }).select(FIELDS).limit(4).lean(),
  ]);
  return (
    <ProductTabs
      bestSelling={trimForCard(bestSelling)}
      popular={trimForCard(popular)}
      newArrivals={trimForCard(newArrivals)}
      featured={trimForCard(featured)}
    />
  );
}

/* Skeleton shown while the DB round-trip streams in */
function CounterSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="tabs">
        {[0, 1, 2, 3].map((i) => (
          <span className="tab" key={i} style={{ opacity: 0.35 }}>···</span>
        ))}
      </div>
      <div className="prod-grid">
        {[0, 1, 2, 3].map((i) => (
          <div
            className="pc-skel"
            key={i}
            style={{ "--d": `${i * 55}ms` } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Preloader />
      <Hero />

      {/* ============ 01 · PRODUCTS ============ */}
      <section id="products" className="sec">
        <div className="wrap">
          <header className="sec-head">
            <div>
              <p className="kicker" data-reveal>
                <span className="k-no">01</span>
                <span className="k-rule" />
                <span>The counter</span>
              </p>
              <h2 data-reveal style={{ "--d": ".08s" } as React.CSSProperties}>
                Baked this morning, <em>gone by tonight.</em>
              </h2>
            </div>
            <p className="sec-note" data-reveal style={{ "--d": ".16s" } as React.CSSProperties}>
              Everything is mixed, shaped and baked the same morning. These are the
              ones Brunswick keeps coming back for.
            </p>
          </header>

          <Suspense fallback={<CounterSkeleton />}>
            <ProductTabsLoader />
          </Suspense>
        </div>
      </section>

      {/* 02 · reviews · 03 · faqs · 04 · contact */}
      <Reviews />
      <Faqs />
      <ContactSection />
    </>
  );
}