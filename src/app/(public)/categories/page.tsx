import type { Metadata } from "next";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { getNestedCategories } from "@/lib/data";
import Aisles from "@/components/categories/Aisles";
import type { Aisle } from "@/components/categories/Aisles";
import PaperPatterns from "@/components/categories/PaperPatterns";
import { SITE_URL as siteUrl } from "@/lib/site";
import "./categories.css";

/* PHASE 4 — ISR: prerendered, revalidated every 5 min; category and
   product mutations call revalidatePath('/categories'). */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Categories — Shop by Craving",
  description:
    "Browse every aisle of Ayoob Bakery — breads, sweets, savoury and more, all baked fresh every morning in Dandenong North, Melbourne. Shop by craving.",
  alternates: { canonical: "/categories" },
};

/* ---------- helpers ---------- */

const PATTERNS = ["pat-boule", "pat-sweet", "pat-savoury", "pat-pour", "pat-scroll"];
const TONES = ["", "ink", "sage", "honey"];

/* aisle tag derived from the REAL badges present in the category */
const TAG_RULES = [
  { badge: "Bestseller", label: "Home of a bestseller" },
  { badge: "Featured", label: "Featured aisle" },
  { badge: "Popular", label: "Popular picks" },
  { badge: "New", label: "Fresh this week" },
];

const PICK_RANK: Record<string, number> = { Bestseller: 0, Featured: 1, Popular: 2, New: 3 };

const effPrice = (p: any): number =>
  p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;

/* the aisle's representative bake: badge rank → ratings → newest */
function choosePick(prods: any[]): any | null {
  if (!prods.length) return null;
  return [...prods].sort((a, b) => {
    const ra = PICK_RANK[a.badge] ?? 9;
    const rb = PICK_RANK[b.badge] ?? 9;
    if (ra !== rb) return ra - rb;
    if ((b.ratings || 0) !== (a.ratings || 0)) return (b.ratings || 0) - (a.ratings || 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  })[0];
}

export default async function CategoriesPage() {
  await dbConnect();

  const [products, nested] = await Promise.all([
    Product.find({})
      .select("name price images unit discount badge category ratings createdAt")
      .lean(),
    getNestedCategories(),
  ]);

  /* ---------- build one aisle per real top-level category ---------- */
  const aisles: Aisle[] = nested.map((top, i) => {
    const subIds = (top.subcategories || []).map((s) => String(s._id));
    const ids = new Set([String(top._id), ...subIds]);
    const prods = products.filter((p: any) => ids.has(String(p.category)));

    const count = prods.length;
    const fromPrice = count ? Math.min(...prods.map(effPrice)) : 0;
    const tagRule = TAG_RULES.find((t) => prods.some((p: any) => p.badge === t.badge));

    const pickRaw = choosePick(prods);
    const subNames = (top.subcategories || []).map((s) => s.name);

    let description =
      (top.description || "").trim() ||
      "Fresh from the morning bake — everything this aisle holds.";
    if (subNames.length) description += ` Inside: ${subNames.join(" · ")}.`;

    return {
      _id: String(top._id),
      name: top.name,
      href: `/products?category=${top._id}`,
      image: top.image || null,
      pattern: PATTERNS[i % PATTERNS.length],
      no: `Aisle ${String(i + 1).padStart(2, "0")}`,
      tag: tagRule ? tagRule.label : "",
      tone: TONES[i % TONES.length],
      description,
      count,
      fromPrice,
      pick: pickRaw
        ? {
            _id: String(pickRaw._id),
            name: pickRaw.name,
            price: +effPrice(pickRaw).toFixed(2),
            image: pickRaw.images?.[0] || null,
            unit: pickRaw.unit,
          }
        : null,
      pickLabel: ["start with", "pair with", "crowd favourite", "this week\u2019s"][i % 4],
      cta: "Browse the aisle",
      stocked: count > 0,
    };
  });

  /* ---------- the dark finale card: the whole board (real totals) ---------- */
  const totalProducts = products.length;
  const globalFrom = totalProducts ? Math.min(...products.map(effPrice)) : 0;

  const boardAisle: Aisle = {
    _id: "board",
    name: "The whole board",
    href: "/products",
    image: null,
    pattern: PATTERNS[aisles.length % PATTERNS.length],
    no: "Last stop",
    tag: "Every aisle · one oven",
    tone: "honey",
    description:
      "Every bake on one page — breads, sweets, savoury and the counter pours, all out of the same oven every morning. When in doubt, browse everything.",
    count: totalProducts,
    fromPrice: globalFrom,
    pick: null,
    pickLabel: "",
    cta: "Browse everything",
    dark: true,
    stocked: totalProducts > 0,
  };

  const totals = { products: totalProducts, categories: nested.length };

  /* ---------- SEO: ItemList of category pages ---------- */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Categories — Shop by Craving",
    numberOfItems: nested.length,
    itemListElement: nested.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "CollectionPage",
        name: c.name,
        url: `${siteUrl}/products?category=${c._id}`,
      },
    })),
  };

  return (
    <>
      <PaperPatterns />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Aisles aisles={[...aisles, boardAisle]} totals={totals} />
    </>
  );
}