"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronRight,
  Flame,
  Plus,
  Search,
  Timer,
  Truck,
  Wheat,
  X,
} from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { money } from "@/lib/format";
import { flyToCart } from "@/lib/flyToCart";
import { scrollToEl } from "@/lib/scroll";

export interface ShopProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  unit: string;
  discount: number;
  badge: string;
  shortDescription: string;
  ratings: number;
  category: { _id: string; name: string } | null;
  topCategoryId: string | null;
}

export interface ShopCategory {
  _id: string;
  name: string;
}

interface ShopProps {
  products: ShopProduct[];
  categories: ShopCategory[];
}

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "plow", label: "Price · low to high" },
  { value: "phigh", label: "Price · high to low" },
  { value: "az", label: "A – Z" },
];

function SparkSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- hero rail tile: one fresh bake, straight from the oven ---------- */
function RailTile({ p }: { p: ShopProduct }) {
  const { addToCart } = useCart();
  const toast = useToast();
  const addRef = useRef<HTMLButtonElement>(null);

  const price = p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;

  const add = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await addToCart(p, 1);
    flyToCart(addRef.current, p.images?.[0]);
    toast(Check, "Added to cart", `${p.name} — ${money(price)}`);
  };

  return (
    <div className="rail-tile">
      <Link href={`/product/${p._id}`} className="rail-link">
        <span className="rail-img">
          {p.images?.[0] ? (
            <Image src={p.images[0]} alt={p.name} fill sizes="180px" className="rail-pic" />
          ) : (
            <Wheat className="rail-noimg" aria-hidden="true" />
          )}
          {p.discount > 0 && <span className="rail-tag">−{Math.round(p.discount)}%</span>}
        </span>
        <b className="rail-name">{p.name}</b>
      </Link>
      <div className="rail-foot">
        <span className="rail-price">{money(price)}</span>
        <button
          ref={addRef}
          type="button"
          className="rail-add"
          onClick={add}
          aria-label={`Add ${p.name} to the cart`}
        >
          <Plus />
        </button>
      </div>
    </div>
  );
}

export default function Shop({ products, categories }: ShopProps) {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("featured");

  const boardRef = useRef<HTMLElement>(null);
  const mastheadRef = useRef<HTMLElement>(null);
  const stampRef = useRef<HTMLSpanElement>(null);

  /* PHASE 4: the page is cache-served now, so deep-link filters
     (/products?category=…&q=…&sort=…) are read from the URL here on
     mount instead of being injected server-side. Runs once. */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCat = params.get("category");
    const urlQ = params.get("q");
    const urlSort = params.get("sort");
    if (urlCat && categories.some((c) => c._id === urlCat)) setCat(urlCat);
    if (urlQ) setQ(urlQ);
    if (urlSort) setSort(urlSort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* the hero rail: the newest bakes (the list arrives newest-first) */
  const railProducts = useMemo(() => products.slice(0, 10), [products]);

  /* live per-category counts */
  const catCount = useMemo(() => {
    const m = new Map<string, number>();
    products.forEach((p) => {
      if (p.topCategoryId) m.set(p.topCategoryId, (m.get(p.topCategoryId) || 0) + 1);
    });
    return m;
  }, [products]);

  /* the board: filter + sort, all client-side and instant */
  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const items = products.filter((p) => {
      if (cat !== "all" && p.topCategoryId !== cat) return false;
      if (needle && !`${p.name} ${p.shortDescription} ${p.category?.name || ""}`.toLowerCase().includes(needle)) return false;
      return true;
    });
    if (sort === "plow") return [...items].sort((a, b) => a.price - b.price);
    if (sort === "phigh") return [...items].sort((a, b) => b.price - a.price);
    if (sort === "az") return [...items].sort((a, b) => a.name.localeCompare(b.name));
    return items;
  }, [products, cat, q, sort]);

  const hasActive = cat !== "all" || !!q.trim();
  const catName = (id: string) => categories.find((c) => c._id === id)?.name || "";

  /* keep the URL shareable (no reload, no history spam) */
  useEffect(() => {
    const params = new URLSearchParams();
    if (cat !== "all") params.set("category", cat);
    if (q.trim()) params.set("q", q.trim());
    if (sort !== "featured") params.set("sort", sort);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `/products?${qs}` : "/products");
  }, [cat, q, sort]);

  /* masthead stamp parallax (fine pointers, motion-safe) */
  useEffect(() => {
    const mast = mastheadRef.current;
    const stamp = stampRef.current;
    if (!mast || !stamp) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let nx = 0, ny = 0, x = 0, y = 0, raf = 0;
    const onMove = (e: PointerEvent) => {
      nx = (e.clientX / window.innerWidth - 0.5) * 2;
      ny = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const tick = () => {
      x += (nx * 12 - x) * 0.07;
      y += (ny * 12 - y) * 0.07;
      stamp.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      raf = requestAnimationFrame(tick);
    };
    mast.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      mast.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const goToBoard = () => {
    if (boardRef.current) scrollToEl(boardRef.current, -20);
  };

  const removeFilter = (k: string) => {
    if (k === "cat") setCat("all");
    else if (k === "q") setQ("");
  };

  const clearAll = () => {
    setCat("all");
    setQ("");
  };

  const pills: { k: string; label: string }[] = [];
  if (cat !== "all") pills.push({ k: "cat", label: catName(cat) });
  if (q.trim()) pills.push({ k: "q", label: `\u201C${q.trim()}\u201D` });

  const liveLabel = q.trim()
    ? `bakes match \u201C${q.trim()}\u201D`
    : hasActive
      ? "bakes match your filters"
      : "bakes on the board this morning";

  const d = (s: string) => ({ "--d": s } as React.CSSProperties);

  return (
    <>
      {/* ============ COMPACT MASTHEAD ============ */}
      <section id="hero" className="masthead" ref={mastheadRef}>
        <div className="wrap">
          <div className="mh-top">
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <ChevronRight className="lucide" />
              <span aria-current="page">The shop</span>
            </nav>
            <p className="mh-live" aria-live="polite">
              <b>{visible.length}</b> <span>{liveLabel}</span>
            </p>
          </div>

          <div className="mh-titlerow">
            <h1 className="mh-title" data-reveal>
              The whole board, <em>fresh daily.</em>
              <span className="mh-spark" aria-hidden="true"><SparkSvg /></span>
            </h1>

            <span className="mh-stamp" ref={stampRef} aria-hidden="true">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="56" fill="#FFFDF6" stroke="#26180E" strokeWidth="2.5" />
                <circle cx="60" cy="60" r="33" fill="none" stroke="#26180E" strokeWidth="1.5" strokeDasharray="2 6" opacity=".5" />
                <defs>
                  <path id="stampPathBoard" d="M60 60 m-45 0 a45 45 0 1 1 90 0 a45 45 0 1 1 -90 0" />
                </defs>
                <text className="mh-stamp-text">
                  <textPath href="#stampPathBoard">AYOOB BAKERY · THE WHOLE BOARD · BAKED THIS MORNING · EST 1996 ·</textPath>
                </text>
                <g stroke="#26180E" strokeWidth="2.4" strokeLinecap="round" fill="none">
                  <path d="M60 46v30" />
                  <path d="M60 53l-8-8M60 53l8-8M60 63l-8-8M60 63l8-8M60 46q1-7 7-9" />
                </g>
              </svg>
            </span>
          </div>

          <div className="mh-bar" data-reveal style={d(".08s")}>
            <form className="mh-search" role="search" onSubmit={(e) => { e.preventDefault(); goToBoard(); }}>
              <span className="mh-sico" aria-hidden="true"><Search /></span>
              <label htmlFor="mhQ" className="sr-only">Search the board</label>
              <input
                id="mhQ"
                type="text"
                placeholder="What are you craving? sourdough, baklava, naan…"
                autoComplete="off"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <button className="btn btn-primary btn-sm" type="submit">
                Show me <ArrowDown />
              </button>
            </form>
          </div>

          {/* the hero showcase — a rail of real products, straight from the oven */}
          {railProducts.length > 0 && (
            <div className="mh-rail" data-reveal style={d(".16s")}>
              <p className="rail-k">
                <Wheat />
                Straight from the oven
                <em>— the newest bakes on the board</em>
              </p>
              <div className="rail-track">
                {railProducts.map((p) => (
                  <RailTile key={p._id} p={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============ THE BOARD ============ */}
      <section id="board" className="shop-sec" ref={boardRef}>
        <div className="wrap">
          {/* real categories + sort */}
          <div className="tool-row">
            {categories.length > 0 && (
              <>
                <button
                  type="button"
                  className={`tchip${cat === "all" ? " on" : ""}`}
                  aria-pressed={cat === "all"}
                  onClick={() => setCat("all")}
                >
                  <Check /> All products <span className="cnt">{products.length}</span>
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    className={`tchip${cat === c._id ? " on" : ""}`}
                    aria-pressed={cat === c._id}
                    onClick={() => setCat(c._id)}
                  >
                    <Check /> {c.name} <span className="cnt">{catCount.get(c._id) ?? 0}</span>
                  </button>
                ))}
              </>
            )}

            <div className="tool-sort">
              <ArrowUpDown />
              <span>Sort</span>
              <span className="selwrap">
                <select
                  id="sortSel"
                  aria-label="Sort products"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <ChevronDown />
              </span>
            </div>
          </div>

          {/* result count + active pills */}
          <div className="tool-meta">
            <p className="rescount">
              {hasActive
                ? `${visible.length} ${visible.length === 1 ? "bake" : "bakes"} match your filters`
                : `${visible.length} bakes on the board`}
            </p>
            <div className="apills">
              {pills.map((p) => (
                <span className="apill" key={p.k}>
                  {p.label}
                  <button
                    className="apill-x"
                    type="button"
                    onClick={() => removeFilter(p.k)}
                    aria-label={`Remove ${p.label} filter`}
                  >
                    <X />
                  </button>
                </span>
              ))}
            </div>
            {!!pills.length && (
              <button className="aclear" type="button" onClick={clearAll}>clear all</button>
            )}
          </div>

          {/* the grid */}
          <div className="cards-grid">
            {visible.length ? (
              visible.map((p, i) => (
                <ProductCard key={p._id} product={p as any} index={i} />
              ))
            ) : (
              <div className="noresults">
                <span className="ring"><Wheat /></span>
                <b>Nothing in the oven with that name</b>
                <p>Loosen a filter or two — the board is bigger than it looks.</p>
                <button className="btn btn-ghost btn-sm" type="button" onClick={clearAll}>
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          <p className="board-note" data-reveal>
            Prices in AUD · everything wrapped in paper, never plastic · sold-out lines reset at
            6:30 am · espresso &amp; chai poured at the counter.
          </p>

          {/* guarantee strip */}
          <div className="gstrip" data-reveal>
            <div className="gcell">
              <span className="g-ico"><Flame /></span>
              <div>
                <b>Baked this morning</b>
                <span>Mixed by hand, out of the oven from 4 am — never frozen, never day-old.</span>
              </div>
            </div>
            <div className="gcell">
              <span className="g-ico"><Timer /></span>
              <div>
                <b>Pickup in ~20 minutes</b>
                <span>Order by phone or in person — we&rsquo;ll have it wrapped and waiting.</span>
              </div>
            </div>
            <div className="gcell">
              <span className="g-ico"><Truck /></span>
              <div>
                <b>Local delivery</b>
                <span>$6 flat within 8 km of Brunswick, free over $50, same morning.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}