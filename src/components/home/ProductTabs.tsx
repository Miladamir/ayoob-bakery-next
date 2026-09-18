"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import type { IProduct } from "@/models/Product";

interface ProductTabsProps {
  bestSelling: IProduct[];
  newArrivals: IProduct[];
  popular: IProduct[];
  featured: IProduct[];
}

export default function ProductTabs({
  bestSelling,
  newArrivals,
  popular,
  featured,
}: ProductTabsProps) {
  const [active, setActive] = useState("bestseller");

  const data: Record<string, IProduct[]> = {
    bestseller: bestSelling,
    popular,
    new: newArrivals,
    featured,
  };

  const tabs = [
    { key: "bestseller", label: "Bestsellers" },
    { key: "popular", label: "Popular" },
    { key: "new", label: "New arrivals" },
    { key: "featured", label: "Featured" },
  ];

  const activeData = data[active] || [];

  return (
    <>
      <div className="tabs" role="tablist" aria-label="Product categories" data-reveal>
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`tab${active === t.key ? " active" : ""}`}
            aria-pressed={active === t.key}
            onClick={() => setActive(t.key)}
          >
            {t.label} · {data[t.key]?.length ?? 0}
          </button>
        ))}
      </div>

      {/* key={active} → cards replay their entrance stagger on every switch */}
      <div className="prod-grid" key={active}>
        {activeData.length > 0 ? (
          activeData.map((p, i) => (
            <ProductCard key={p._id.toString()} product={p} index={i} />
          ))
        ) : (
          <p className="board-note" style={{ gridColumn: "1 / -1" }}>
            Nothing on this shelf right now — check back after the morning bake.
          </p>
        )}
      </div>

      <div className="all-cta" data-reveal>
        <Link className="btn btn-primary" href="/products">
          Browse all products <ArrowRight />
        </Link>
        <p className="board-note">
          The full board lives on the products page — weekly specials and all.
        </p>
      </div>
    </>
  );
}