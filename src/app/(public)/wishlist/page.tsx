import type { Metadata } from "next";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import WishlistClient from "@/components/wishlist/WishlistClient";
import "./wishlist.css";

/* Suggestions for the empty shelf: bestsellers → featured → newest, cap 3 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Your Favourites — The Shelf of Loves",
  description:
    "Your favourites at Ayoob Bakery — every bake you've hearted, gathered on one shelf. Add them to your order in one tap.",
  robots: { index: false, follow: true }, // personal content — never indexed
};

const FIELDS = "name price images unit discount";

export default async function WishlistPage() {
  await dbConnect();

  let suggestions: any[] = await Product.find({ badge: "Bestseller" })
    .select(FIELDS)
    .sort({ ratings: -1 })
    .limit(3)
    .lean();

  if (suggestions.length < 3) {
    const exclude = suggestions.map((s) => s._id);
    const more = await Product.find({ badge: "Featured", _id: { $nin: exclude } })
      .select(FIELDS)
      .limit(3 - suggestions.length)
      .lean();
    suggestions = [...suggestions, ...more];
  }
  if (suggestions.length < 3) {
    const exclude = suggestions.map((s) => s._id);
    const more = await Product.find({ _id: { $nin: exclude } })
      .select(FIELDS)
      .sort({ createdAt: -1 })
      .limit(3 - suggestions.length)
      .lean();
    suggestions = [...suggestions, ...more];
  }

  /* PAYLOAD DIET (Phase 3): the empty-shelf quick-adds render one image
     each — ship exactly that instead of the raw documents. */
  const trimmed = suggestions.map((s: any) => ({
    _id: String(s._id),
    name: s.name,
    price: s.price,
    images: s.images?.slice(0, 1) ?? [],
    unit: s.unit,
    discount: s.discount ?? 0,
  }));

  return <WishlistClient suggestions={trimmed} />;
}