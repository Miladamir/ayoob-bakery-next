"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronRight,
  Heart,
  HeartOff,
  ShoppingBasket,
  Trash2,
  Wheat,
} from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { money } from "@/lib/format";
import { melbourneNow } from "@/lib/hours";

export interface SuggestionProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  unit: string;
  discount: number;
}

const SORTS = [
  { value: "saved", label: "Newest hearts first" },
  { value: "plow", label: "Price · low to high" },
  { value: "phigh", label: "Price · high to low" },
  { value: "az", label: "A – Z" },
  { value: "cat", label: "By aisle" },
];

const plu = (n: number) => (n === 1 ? "" : "s");

function SparkSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"
        fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"
      />
    </svg>
  );
}

const effPrice = (p: any): number =>
  p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;
const catName = (p: any): string => (p.category as any)?.name || "Uncategorised";

export default function WishlistClient({ suggestions }: { suggestions: SuggestionProduct[] }) {
  const { wishlistIds, wishlistReady, toggleWishlist, refreshWishlist } = useWishlist();
  const { cartItems, addToCart } = useCart();
  const { data: session } = useSession();
  const toast = useToast();

  const [products, setProducts] = useState<any[] | null>(null);
  const [error, setError] = useState(false);
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("saved");
  const [exiting, setExiting] = useState<Set<string>>(new Set());
  const [greet, setGreet] = useState("");

  /* greeting — after mount, Melbourne time (hydration-safe) */
  useEffect(() => {
    const h = melbourneNow().h;
    const g = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    const name = session?.user?.name?.split(" ")[0];
    setGreet(`${g}, ${name || "neighbour"}.`);
  }, [session]);

  /* fetch the hearted products (with ghost cleanup) */
  useEffect(() => {
    if (!wishlistReady) return; // context still initializing — keep the skeleton
    let cancelled = false;

    const load = async () => {
      if (!wishlistIds.length) {
        if (!cancelled) {
          setProducts([]);
          setError(false);
        }
        return;
      }
      try {
        const res = await fetch(
          `/api/products/by-ids?ids=${wishlistIds.join(",")}&t=${Date.now()}`
        );
        const data = res.ok ? await res.json() : null;
        if (cancelled) return;
        if (!data) {
          setError(true);
          return;
        }
        setProducts(data);
        setError(false);

        // clean "ghost" ids — products deleted since they were hearted
        const fetched = data.map((p: any) => String(p._id));
        const ghosts = wishlistIds.filter((id) => !fetched.includes(id));
        if (ghosts.length) refreshWishlist(fetched);
      } catch {
        if (!cancelled) setError(true);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [wishlistIds, wishlistReady, refreshWishlist]);

  /* ---------- derived ---------- */
  const idSet = useMemo(() => new Set(wishlistIds), [wishlistIds]);

  const wishlistProducts = useMemo(
    () => (products || []).filter((p) => idSet.has(String(p._id))),
    [products, idSet]
  );

  const catCounts = useMemo(() => {
    const m = new Map<string, number>();
    wishlistProducts.forEach((p) => {
      const n = catName(p);
      m.set(n, (m.get(n) || 0) + 1);
    });
    return m;
  }, [wishlistProducts]);

  const visible = useMemo(() => {
    let list = wishlistProducts;
    if (cat !== "all") list = list.filter((p) => catName(p) === cat);
    switch (sort) {
      case "saved":
        // wishlistIds order = heart order; newest hearts first
        return [...list].sort(
          (a, b) =>
            wishlistIds.indexOf(String(b._id)) - wishlistIds.indexOf(String(a._id))
        );
      case "plow":
        return [...list].sort((a, b) => effPrice(a) - effPrice(b));
      case "phigh":
        return [...list].sort((a, b) => effPrice(b) - effPrice(a));
      case "az":
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
      case "cat":
        return [...list].sort(
          (a, b) => catName(a).localeCompare(catName(b)) || a.name.localeCompare(b.name)
        );
      default:
        return list;
    }
  }, [wishlistProducts, cat, sort, wishlistIds]);

  const inCartCount = useMemo(
    () => cartItems.filter((i) => idSet.has(i._id)).length,
    [cartItems, idSet]
  );

  const loading = !wishlistReady || (wishlistIds.length > 0 && products === null);
  const isEmpty = wishlistReady && wishlistIds.length === 0;

  /* ---------- actions ---------- */

  /* unheart with exit animation + undo */
  const unheart = (id: string, name: string) => {
    if (exiting.has(id)) return;
    const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setExiting((prev) => new Set(prev).add(id));
    let done = false;
    const t = window.setTimeout(async () => {
      done = true;
      await toggleWishlist(id);
      setExiting((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    }, RM ? 0 : 230);

    toast(HeartOff, "Off the shelf", `${name} — no hard feelings.`, {
      label: "Undo",
      fn: () => {
        if (done) return;
        window.clearTimeout(t);
        setExiting((prev) => {
          const n = new Set(prev);
          n.delete(id);
          return n;
        });
        toast(Heart, "Back on the shelf", `${name} returned to its spot.`);
      },
    });
  };

  const addAll = async () => {
    if (!wishlistProducts.length) return;
    for (const p of wishlistProducts) await addToCart(p, 1);
    toast(
      Check,
      "The shelf, ordered",
      `${wishlistProducts.length} favourite${plu(wishlistProducts.length)} added to your cart.`
    );
  };

  const clearAll = async () => {
    if (!wishlistIds.length) return;
    const snapshot = [...wishlistIds];
    for (const id of snapshot) await toggleWishlist(id);
    toast(Trash2, "Shelf cleared", "Every love, returned to the board.", {
      label: "Undo",
      fn: async () => {
        for (const id of snapshot) await toggleWishlist(id);
        toast(
          Heart,
          "Shelf restored",
          `${snapshot.length} favourite${plu(snapshot.length)} back where you left them.`
        );
      },
    });
  };

  const heartSuggestion = async (id: string, name: string) => {
    await toggleWishlist(id);
    toast(Heart, "On the shelf", `${name} will wait for you.`);
  };

  const d = (s: string) => ({ "--d": s } as React.CSSProperties);

  return (
    <>
      {/* ============ COMPACT MASTHEAD ============ */}
      <section id="hero" className="masthead">
        <div className="wrap">
          <div className="mh-top">
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <ChevronRight className="lucide" />
              <span aria-current="page">Your favourites</span>
            </nav>
            <p className="mh-live" aria-live="polite">
              <b>{wishlistIds.length}</b> {wishlistIds.length === 1 ? "love" : "loves"} ·{" "}
              <b>{inCartCount}</b> in your order
            </p>
          </div>

          <div className="mh-titlerow">
            <h1 className="mh-title">
              The shelf of <em>favorites.</em>
              <span className="mh-spark" aria-hidden="true"><SparkSvg /></span>
            </h1>

            <span className="mh-stamp" aria-hidden="true">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="56" fill="#FFFDF6" stroke="#26180E" strokeWidth="2.5" />
                <circle cx="60" cy="60" r="33" fill="none" stroke="#26180E" strokeWidth="1.5" strokeDasharray="2 6" opacity=".5" />
                <defs>
                  <path id="stampPathFav" d="M60 60 m-45 0 a45 45 0 1 1 90 0 a45 45 0 1 1 -90 0" />
                </defs>
                <text className="mh-stamp-text">
                  <textPath href="#stampPathFav">AYOOB BAKERY · THE SHELF OF Favorites · HEARTS NEVER EXPIRE · EST 1952 ·</textPath>
                </text>
                <path
                  d="M60 82 C42 67 33 57 33 46 C33 37 40 31 48 31 C53 31 58 34 60 39 C62 34 67 31 72 31 C80 31 87 37 87 46 C87 57 78 67 60 82 Z"
                  fill="#C4551E" stroke="#26180E" strokeWidth="2.4"
                />
              </svg>
            </span>
          </div>

          <p className="mh-sub" data-reveal>
            {greet ? `${greet} ` : ""}Every bake you&rsquo;ve hearted, waiting on one shelf —{" "}
            <b>hearts never expire.</b>
          </p>
        </div>
      </section>

      {/* ============ THE SHELF ============ */}
      <section id="shelf" className="shelf-sec">
        <div className="wrap">
          {loading ? (
            <div className="fav-grid" aria-hidden="true">
              {[...Array(4)].map((_, i) => (
                <div className="wl-skel" key={i} style={d(`${i * 55}ms`)} />
              ))}
            </div>
          ) : error ? (
            <div className="fav-empty" data-reveal>
              <span className="ring"><Wheat /></span>
              <b>Couldn&rsquo;t reach the shelf</b>
              <p>The kitchen link dropped — check your connection and give it another go.</p>
              <div className="btns">
                <button className="btn btn-primary btn-sm" type="button" onClick={() => window.location.reload()}>
                  Try again
                </button>
              </div>
            </div>
          ) : isEmpty ? (
            /* ---- the bare shelf ---- */
            <div className="fav-empty" data-reveal>
              <span className="ring"><Heart /></span>
              <b>Nothing hearted yet</b>
              <p>
                The shelf is bare but hopeful. Tap the heart on anything — the board, a product
                page, anywhere — and it&rsquo;ll wait for you here. Start with the counter&rsquo;s
                three certainties:
              </p>

              {suggestions.length > 0 && (
                <div className="qa-grid">
                  {suggestions.map((s) => (
                    <div className="qa-row" key={s._id}>
                      <span className="qa-art">
                        {s.images?.[0] ? (
                          <Image src={s.images[0]} alt="" width={40} height={40} className="qa-img" />
                        ) : (
                          <Wheat />
                        )}
                      </span>
                      <span className="qa-main">
                        <b>{s.name}</b>
                        <span>
                          {money(s.discount > 0 ? s.price * (1 - s.discount / 100) : s.price)} · {s.unit}
                        </span>
                      </span>
                      <button
                        className="qa-heart"
                        type="button"
                        onClick={() => heartSuggestion(s._id, s.name)}
                        aria-label={`Heart ${s.name}`}
                      >
                        <Heart />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="btns">
                <Link className="btn btn-primary btn-sm" href="/products">
                  Browse the whole board <ArrowRight />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* toolbar */}
              <div className="ft-bar" data-reveal>
                <p className="ft-count" aria-live="polite">
                  <b>{visible.length}</b>{" "}
                  {cat === "all" ? "favorites on the shelf" : `favorites in ${cat}`}
                </p>

                {catCounts.size > 1 && (
                  <div className="ft-chips" role="group" aria-label="Filter by aisle">
                    <button
                      className={`ft-chip${cat === "all" ? " on" : ""}`}
                      type="button"
                      onClick={() => setCat("all")}
                    >
                      All <span className="cnt">{wishlistProducts.length}</span>
                    </button>
                    {[...catCounts.entries()].map(([name, n]) => (
                      <button
                        key={name}
                        className={`ft-chip${cat === name ? " on" : ""}`}
                        type="button"
                        onClick={() => setCat(name)}
                      >
                        {name} <span className="cnt">{n}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="ft-sort">
                  <ArrowUpDown />
                  <span>Sort</span>
                  <span className="selwrap">
                    <select
                      aria-label="Sort favourites"
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

                <div className="ft-actions">
                  <button className="btn btn-primary btn-sm" type="button" onClick={addAll}>
                    <ShoppingBasket /> Add all to your order
                  </button>
                  <button className="ft-clear" type="button" onClick={clearAll}>
                    clear the shelf
                  </button>
                </div>
              </div>

              {/* the grid */}
              <div className="fav-grid">
                {visible.length ? (
                  visible.map((p, i) => (
                    <ProductCard
                      key={String(p._id)}
                      product={p}
                      index={i}
                      exiting={exiting.has(String(p._id))}
                      onUnheart={(pid) => unheart(pid, p.name)}
                    />
                  ))
                ) : (
                  <div className="fav-empty">
                    <span className="ring"><Wheat /></span>
                    <b>No {cat} on the shelf yet</b>
                    <p>Your loves lean elsewhere for now — clear the filter to see the whole shelf.</p>
                    <div className="btns">
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => setCat("all")}>
                        Clear the filter
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <p className="board-note" data-reveal>
                Hearts never expire · sold-out loves return with the morning bake.
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}