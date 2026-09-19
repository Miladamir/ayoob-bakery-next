import type { Metadata } from "next";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { stripHtml } from "@/lib/format";
import SearchClient from "@/components/search/SearchClient";
import "./search.css";

/* PHASE 4 — ISR: no searchParams on the server (SearchClient reads ?q=
   on mount), so the search page — the heaviest payload on the site —
   is now prerendered and cache-served. */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Search the Board",
  description:
    "Search every bake on the Ayoob Bakery board — sourdough, naan, croissants, baklava and more, fresh from the Dandenong North oven every morning.",
  robots: { index: false, follow: true },
};

export default async function SearchPage() {
  await dbConnect();

  /* the whole board in one query — search then happens instantly,
     client-side, with zero round-trips per keystroke */
  const products = await Product.find({})
    .select("name price images unit discount badge shortDescription description category ratings")
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .lean();

  const pool = products.map((p: any) => ({
    _id: String(p._id),
    name: p.name,
    price:
      p.discount > 0 ? +(p.price * (1 - p.discount / 100)).toFixed(2) : p.price,
    images: p.images?.slice(0, 1) ?? [],
    unit: p.unit,
    discount: p.discount || 0,
    badge: p.badge || "",
    shortDescription:
      p.shortDescription || stripHtml(p.description || "").slice(0, 110),
    descriptionPlain: stripHtml(p.description || "").slice(0, 220),
    categoryName: (p.category as any)?.name || "",
    ratings: p.ratings || 0,
  }));

  return <SearchClient pool={pool} />;
}