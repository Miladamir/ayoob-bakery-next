import { Suspense } from "react";
import type { Metadata } from "next";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Preloader from "@/components/effects/Preloader";
import Hero from "@/components/home/Hero";
import Wall from "@/components/home/Wall";
import ProductTabs from "@/components/home/ProductTabs";
import Reviews from "@/components/home/Reviews";
import Faqs from "@/components/home/Faqs";
import ContactSection from "@/components/home/ContactSection";
import { stripHtml } from "@/lib/format";
import {
  SITE_URL as siteUrl,
  BUSINESS_NAME,
  PHONE_TEL,
  SOCIAL_PROFILES,
} from "@/lib/site";
import "./home.css";

/* ISR: the homepage is prerendered and re-validated every 5 minutes.
   Admin actions already call revalidatePath('/'), so edits appear instantly. */
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/* Local SEO — Bakery structured data */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Bakery",
  name: BUSINESS_NAME,
  logo: {
    "@type": "ImageObject",
    url: `${siteUrl}/images/logo.png`,
  },
  description:
    "Traditional Afghan pastries — coconut puff pastries, cardamom shortbread, braided sesame bread and more, baked fresh daily in Dandenong North.",
  url: siteUrl,
  image: `${siteUrl}/images/og-image.jpg`,
  telephone: PHONE_TEL,
  foundingDate: "1952",
  sameAs: SOCIAL_PROFILES,
  address: {
    "@type": "PostalAddress",
    streetAddress: "4 Stevenson Ave",
    addressLocality: "Dandenong North",
    addressRegion: "VIC",
    postalCode: "3175",
    addressCountry: "AU",
  },
  geo: { "@type": "GeoCoordinates", latitude: -37.9644, longitude: 145.2103 },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00", closes: "18:00",
    },
  ],
};

/* ---------- 01 · the wall loader ---------- */

const WALL_FIELDS = "name price images unit discount badge createdAt";
const WALL_CAP = 12;
const WALL_RANK: Record<string, number> = { Bestseller: 0, Featured: 1, Popular: 2, New: 3 };

async function WallLoader() {
  await dbConnect();
  const all: any[] = await Product.find({}).select(WALL_FIELDS).lean();

  /* photographed bakes first (the wall is a photo gallery), then
     badge rank, then newest — capped so the section never sprawls */
  const ranked = all
    .map((p) => ({ ...p, hasImage: !!(p.images && p.images[0]) }))
    .sort((a, b) => {
      if (a.hasImage !== b.hasImage) return a.hasImage ? -1 : 1;
      const ra = WALL_RANK[a.badge] ?? 9;
      const rb = WALL_RANK[b.badge] ?? 9;
      if (ra !== rb) return ra - rb;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    })
    .slice(0, WALL_CAP)
    .map((p) => ({
      _id: String(p._id),
      name: p.name,
      price: p.price,
      image: p.hasImage ? p.images[0] : null,
      unit: p.unit,
      discount: p.discount || 0,
    }));

  return <Wall products={ranked} total={all.length} />;
}

function WallSkeleton() {
  return (
    <div className="wall-skel" aria-hidden="true">
      {[...Array(8)].map((_, i) => (
        <div
          className="wt-skel"
          key={i}
          style={{ "--d": `${i * 55}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ---------- 02 · the counter loader ---------- */

const FIELDS = "name price images unit discount badge shortDescription description ratings createdAt";

/* 12 cards = 4 rows of 3 — the section's hard ceiling */
const TAB_CAP = 12;

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
  const all: any[] = await Product.find({}).select(FIELDS).lean();

  /* Each tab leads with ITS badge products, then tops up from the
     rest of the board (ratings, then newest — newest-first for the
     New tab) so the section always fills 3–4 rows. Capped at 12
     (= exactly 4 rows of 3, never more). As the catalog grows past
     12, tabs become purely badge-driven. */
  const buildTab = (badge: string, newestFirst = false) => {
    const primary = all.filter((p) => p.badge === badge);
    const ids = new Set(primary.map((p) => String(p._id)));
    const rest = all
      .filter((p) => !ids.has(String(p._id)))
      .sort((a, b) =>
        newestFirst
          ? new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          : (b.ratings || 0) - (a.ratings || 0) ||
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    return [...primary, ...rest].slice(0, TAB_CAP);
  };

  return (
    <ProductTabs
      bestSelling={trimForCard(buildTab("Bestseller"))}
      popular={trimForCard(buildTab("Popular"))}
      newArrivals={trimForCard(buildTab("New", true))}
      featured={trimForCard(buildTab("Featured"))}
    />
  );
}

function CounterSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="tabs">
        {[0, 1, 2, 3].map((i) => (
          <span className="tab" key={i} style={{ opacity: 0.35 }}>···</span>
        ))}
      </div>
      <div className="prod-grid">
        {[0, 1, 2, 3, 4, 5].map((i) => (
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

      {/* ============ 01 · THE WALL ============ */}
      <section id="gallery" className="sec sec--tint wall-sec">
        <div className="wrap">
          <header className="sec-head">
            <div>
              <p className="kicker" data-reveal>
                <span className="k-no">01</span>
                <span className="k-rule" />
                <span>The wall</span>
              </p>
              <h2 data-reveal style={{ "--d": ".08s" } as React.CSSProperties}>
                The morning&rsquo;s bake, <em>wall to wall.</em>
              </h2>
            </div>
            <p className="sec-note" data-reveal style={{ "--d": ".16s" } as React.CSSProperties}>
              Photographed as they left the counter this morning — tap any photo for
              ingredients, nutrition and reviews.
            </p>
          </header>

          <Suspense fallback={<WallSkeleton />}>
            <WallLoader />
          </Suspense>
        </div>
      </section>

      {/* ============ 02 · PRODUCTS ============ */}
      <section id="products" className="sec">
        <div className="wrap">
          <header className="sec-head">
            <div>
              <p className="kicker" data-reveal>
                <span className="k-no">02</span>
                <span className="k-rule" />
                <span>The counter</span>
              </p>
              <h2 data-reveal style={{ "--d": ".08s" } as React.CSSProperties}>
                Baked this morning, <em>gone by tonight.</em>
              </h2>
            </div>
            <p className="sec-note" data-reveal style={{ "--d": ".16s" } as React.CSSProperties}>
              Everything is mixed, shaped and baked the same morning — traditional Afghan
              recipes, the ones Melbourne keeps coming back for.
            </p>
          </header>

          <Suspense fallback={<CounterSkeleton />}>
            <ProductTabsLoader />
          </Suspense>
        </div>
      </section>

      {/* 03 · reviews · 04 · faqs · 05 · contact */}
      <Reviews />
      <Faqs />
      <ContactSection />
    </>
  );
}