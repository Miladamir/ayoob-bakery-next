import type { Metadata } from "next";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import CartClient from "@/components/cart/CartClient";
import "./cart.css";

/* The pool feeds the empty-state quick-adds and the "goes well with"
   cross-sell: bestsellers first, then the freshest bakes. */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Your Order — Cart",
  description:
    "Review your order at Ayoob Bakery — pick-up only from 312 Lygon Street, Brunswick. Wrapped in paper, ready in about 20 minutes.",
  robots: { index: false, follow: true }, // personal content — never indexed
};

const FIELDS = "name price images unit discount badge category";

export default async function CartPage() {
  await dbConnect();

  const [best, rest] = await Promise.all([
    Product.find({ badge: "Bestseller" }).select(FIELDS).populate("category", "name").sort({ ratings: -1 }).limit(6).lean(),
    Product.find({}).select(FIELDS).populate("category", "name").sort({ createdAt: -1 }).limit(30).lean(),
  ]);

  const seen = new Set<string>();
  const pool = [...best, ...rest]
    .filter((p: any) => {
      const id = String(p._id);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map((p: any) => ({
      _id: String(p._id),
      name: p.name,
      price: p.discount > 0 ? +(p.price * (1 - p.discount / 100)).toFixed(2) : p.price,
      // PAYLOAD DIET (Phase 3): the slip + bag + fly-to-cart all use images[0]
      images: p.images?.slice(0, 1) ?? [],
      unit: p.unit,
      discount: p.discount || 0,
      badge: p.badge || "",
      categoryName: (p.category as any)?.name || "",
    }))
    .slice(0, 30);

  return <CartClient pool={pool} />;
}