import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, MapPin, Phone, Wheat } from "lucide-react";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { getNestedCategories } from "@/lib/data";
import { stripHtml, money } from "@/lib/format";
import HoursCard from "@/components/home/HoursCard";
import {
  SITE_URL as siteUrl,
  BUSINESS_NAME,
  PHONE_HREF,
  PHONE_DISPLAY,
  SHOP_ADDRESS,
} from "@/lib/site";
import "./menu.css";

/* ISR — same cadence as the catalog; product/category admin routes
   revalidate /menu explicitly (added this phase). */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Bakery Menu & Prices — Dandenong North",
  description:
    "The full Ayoob Bakery menu with prices — coconut puff pastries, cardamom shortbread, cream horns, braided breads and more, baked fresh every morning in Dandenong North. Order for pickup.",
  alternates: { canonical: "/menu" },
  openGraph: {
    title: "Bakery Menu & Prices — Dandenong North | Ayoob Bakery Melbourne",
    description:
      "The full menu with prices — coconut puffs, cardamom shortbread, cream horns, braided breads and more, baked fresh daily in Dandenong North.",
    type: "website",
  },
};

/* ---------- helpers ---------- */

const effPrice = (p: any): number =>
  p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;

/* menus stay quiet about "each" — only weighted units get a suffix */
const unitSuffix = (u: string): string =>
  u === "kg" ? "/ kg" : u === "lb" ? "/ lb" : "";

function SparkSvg() {
  return (
    <svg className="mh-spark" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"
        fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"
      />
    </svg>
  );
}

export default async function MenuPage() {
  await dbConnect();

  const [products, nested] = await Promise.all([
    Product.find({})
      .select("name price unit discount badge shortDescription description category")
      .sort({ name: 1 })
      .lean(),
    getNestedCategories(),
  ]);

  /* one menu section per top-level category (subcategories fold in) */
  const sections = (nested as any[])
    .map((top, i) => {
      const ids = new Set([
        String(top._id),
        ...(top.subcategories || []).map((s: any) => String(s._id)),
      ]);
      const items = (products as any[]).filter((p) => ids.has(String(p.category)));
      return {
        no: String(i + 1).padStart(2, "0"),
        name: top.name,
        items,
        from: items.length ? Math.min(...items.map(effPrice)) : 0,
      };
    })
    .filter((s) => s.items.length > 0);

  /* uncategorized bakes are never hidden — they get the counter section */
  const assigned = new Set(
    sections.flatMap((s) => s.items.map((i: any) => String(i._id)))
  );
  const loose = (products as any[]).filter((p) => !assigned.has(String(p.category)));
  if (loose.length) {
    sections.push({
      no: String(sections.length + 1).padStart(2, "0"),
      name: "Straight from the counter",
      items: loose,
      from: Math.min(...loose.map(effPrice)),
    });
  }

  const total = (products as any[]).length;

  /* ---------- SEO: Menu structured data ----------
     Honest note: Menu is not a Google rich-result type — this is
     schema.org for Bing/semantic/assistive use. The page's real SEO
     value is the keyword-targeted content + the internal links. */
  const menuLd = {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `${BUSINESS_NAME} — Menu`,
    url: `${siteUrl}/menu`,
    hasMenuSection: sections.map((s) => ({
      "@type": "MenuSection",
      name: s.name,
      hasMenuItem: s.items.map((p: any) => ({
        "@type": "MenuItem",
        name: p.name,
        description:
          p.shortDescription || stripHtml(p.description || "").slice(0, 200) || undefined,
        url: `${siteUrl}/product/${p._id}`,
        offers: {
          "@type": "Offer",
          price: effPrice(p).toFixed(2),
          priceCurrency: "AUD",
        },
      })),
    })),
  };

  const d = (s: string) => ({ "--d": s } as React.CSSProperties);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuLd) }}
      />

      {/* ============ COMPACT MASTHEAD ============ */}
      <section id="hero" className="masthead">
        <div className="wrap">
          <div className="mh-top">
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <ChevronRight className="lucide" />
              <span aria-current="page">Menu</span>
            </nav>
            <p className="mh-live" aria-live="polite">
              <b>{total}</b> {total === 1 ? "bake" : "bakes"} · <b>{sections.length}</b>{" "}
              {sections.length === 1 ? "section" : "sections"} · baked this morning
            </p>
          </div>

          <div className="mh-titlerow">
            <h1 className="mh-title" data-reveal>
              The menu, <em>priced honestly.</em>
              <SparkSvg />
            </h1>

            <span className="mh-stamp" aria-hidden="true">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="56" fill="#FFFDF6" stroke="#26180E" strokeWidth="2.5" />
                <circle cx="60" cy="60" r="33" fill="none" stroke="#26180E" strokeWidth="1.5" strokeDasharray="2 6" opacity=".5" />
                <defs>
                  <path id="stampPathMenu" d="M60 60 m-45 0 a45 45 0 1 1 90 0 a45 45 0 1 1 -90 0" />
                </defs>
                <text className="mh-stamp-text">
                  <textPath href="#stampPathMenu">AYOOB BAKERY · THE MENU · DANDENONG NORTH · EST 1952 ·</textPath>
                </text>
                <g stroke="#26180E" strokeWidth="2.4" strokeLinecap="round" fill="none">
                  <path d="M60 46v30" />
                  <path d="M60 53l-8-8M60 53l8-8M60 63l-8-8M60 63l8-8M60 46q1-7 7-9" />
                </g>
              </svg>
            </span>
          </div>

          <p className="mh-sub" data-reveal>
            Everything on the board, priced as it stands — <b>pick-up only</b>, wrapped in
            paper, baked the same morning.
          </p>
        </div>
      </section>

      {/* ============ THE SHEET ============ */}
      <section className="menu-sec">
        <div className="wrap">
          {sections.length === 0 ? (
            <div className="menu-empty" data-reveal>
              <span className="ring"><Wheat /></span>
              <b>The menu is being written</b>
              <p>
                The ovens are warming and the board is being stocked — check back after
                the morning bake.
              </p>
              <Link className="btn btn-ghost btn-sm" href="/products">Browse the board</Link>
            </div>
          ) : (
            <div className="menu-layout">
              {/* the paper menu */}
              <div className="menu-sheet">
                {sections.map((s, i) => (
                  <div
                    className="menu-sec-block"
                    data-reveal
                    key={s.no}
                    style={d(`${i * 0.06}s`)}
                  >
                    <div className="menu-sec-k">
                      <span className="k-no">{s.no}</span>
                      <h2>{s.name}</h2>
                      <span className="menu-sec-meta">
                        {s.items.length} {s.items.length === 1 ? "bake" : "bakes"} · from{" "}
                        <b>{money(s.from)}</b>
                      </span>
                    </div>

                    <div className="menu-list">
                      {s.items.map((p: any) => {
                        const desc =
                          p.shortDescription || stripHtml(p.description || "").slice(0, 110);
                        const suffix = unitSuffix(p.unit);
                        return (
                          <Link
                            href={`/product/${p._id}`}
                            className="menu-item"
                            key={String(p._id)}
                          >
                            <span className="menu-line">
                              <b className="menu-item-name">{p.name}</b>
                              <span className="menu-leader" aria-hidden="true" />
                              {p.discount > 0 && <s className="menu-was">{money(p.price)}</s>}
                              <b className="menu-price">
                                {money(effPrice(p))}
                                {suffix && <i>{suffix}</i>}
                              </b>
                            </span>
                            {desc && <span className="menu-desc">{desc}</span>}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* order column */}
              <aside className="menu-aside" data-reveal style={d(".1s")}>
                <HoursCard />
                <div className="menu-call">
                  <p>
                    <b>Order for pickup</b> — ring the counter and we&rsquo;ll have it
                    wrapped and waiting in about 20 minutes.
                  </p>
                  <a className="btn btn-primary" href={PHONE_HREF}>
                    <Phone /> Call {PHONE_DISPLAY}
                  </a>
                  <p className="menu-addr">
                    <MapPin /> {SHOP_ADDRESS}
                  </p>
                </div>
              </aside>
            </div>
          )}

          <p className="board-note" data-reveal>
          Prices in AUD · everything wrapped in paper · sold-out lines reset at
            8:00 am. 
          </p>
        </div>
      </section>
    </>
  );
}