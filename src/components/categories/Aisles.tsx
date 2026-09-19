"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Flame,
  Plus,
  Timer,
  Truck,
  Wheat,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { money } from "@/lib/format";
import { flyToCart } from "@/lib/flyToCart";

/* ---------- types ---------- */

export interface AislePick {
  _id: string;
  name: string;
  price: number;
  image: string | null;
  unit: string;
}

export interface Aisle {
  _id: string;
  name: string;
  href: string;
  image: string | null;
  pattern: string;
  no: string;
  tag: string;
  tone: string;
  description: string;
  count: number;
  fromPrice: number;
  pick: AislePick | null;
  pickLabel: string;
  cta: string;
  dark?: boolean;
  stocked?: boolean; // false → category exists but has no products yet
}

interface AislesProps {
  aisles: Aisle[];
  totals: { products: number; categories: number };
}

const PICK_LABELS = ["start with", "pair with", "crowd favourite", "this week\u2019s"];

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

/* ---------- one aisle card ---------- */

function AisleCard({ aisle, index }: { aisle: Aisle; index: number }) {
  const { addToCart } = useCart();
  const toast = useToast();
  const [flick, setFlick] = useState(false);

  const addPick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!aisle.pick) return;
    await addToCart(
      {
        _id: aisle.pick._id,
        name: aisle.pick.name,
        price: aisle.pick.price,
        images: aisle.pick.image ? [aisle.pick.image] : [],
        unit: aisle.pick.unit,
      },
      1
    );
    flyToCart(e.currentTarget, aisle.pick.image || undefined);
    setFlick(true);
    window.setTimeout(() => setFlick(false), 900);
    toast(Check, "Added to cart", `${aisle.pick.name} — ${money(aisle.pick.price)}`);
  };

  const span = index % 2 === 0 ? "ac--a" : "ac--b";
  const cls = ["ac", span, aisle.dark ? "ac--dark" : "", aisle.stocked === false ? "ac--emptyish" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cls} style={{ "--d": `${index * 80}ms` } as React.CSSProperties}>
      {/* art plate with the wrap-paper pattern */}
            {/* art plate — the category photo fills it; the wrap-paper pattern is the fallback */}
      <div className="ac-art">
        {aisle.image ? (
          <>
            <Image
              src={aisle.image}
              alt=""
              fill
              sizes="(max-width: 640px) 92vw, (max-width: 1080px) 46vw, 720px"
              className="ac-img"
            />
            <span className="ac-shade" aria-hidden="true" />
          </>
        ) : aisle.dark ? (
          /* only the whole-board finale keeps its pattern — static now */
          <svg className="ac-paper" aria-hidden="true">
            <rect width="100%" height="100%" fill={`url(#${aisle.pattern})`} />
          </svg>
        ) : null}

        {aisle.tag && (
          <span className={`ac-tag${aisle.tone ? ` ac-tag--${aisle.tone}` : ""}`}>{aisle.tag}</span>
        )}
        <span className="ac-spark" aria-hidden="true">
          <SparkSvg />
        </span>

        <div className="ac-sticker">
          <span className="ac-no">{aisle.no}</span>
          <h3 className="ac-name">{aisle.name}</h3>
          <p className="ac-meta">
            {aisle.stocked === false ? (
              <span>being stocked — check back soon</span>
            ) : (
              <>
                <b className="ac-count" data-count={aisle.count}>{aisle.count}</b>
                <span>{aisle.count === 1 ? "bake" : "bakes"} · from</span>
                <b className="ac-from">{money(aisle.fromPrice)}</b>
              </>
            )}
          </p>
        </div>
      </div>

      {/* body */}
      <div className="ac-body">
        <p className="ac-desc">{aisle.description}</p>

        {aisle.pick && (
          <div className="ac-pick">
            <span className="ac-pick-ico">
              {aisle.pick.image ? (
                <Image
                  src={aisle.pick.image}
                  alt=""
                  width={36}
                  height={36}
                  className="ac-pick-img"
                />
              ) : (
                <Wheat className="ac-pick-wheat" aria-hidden="true" />
              )}
            </span>
            <span className="ac-pick-t">
              <small>{aisle.pickLabel}</small>
              <b>{aisle.pick.name}</b>
            </span>
            <span className="ac-pick-p">{money(aisle.pick.price)}</span>
            <button
              type="button"
              className={`ac-pick-a${flick ? " ac-pick-a--done" : ""}`}
              onClick={addPick}
              aria-label={`Add ${aisle.pick.name} to the cart`}
            >
              {flick ? <Check /> : <Plus />}
            </button>
          </div>
        )}

        <div className="ac-foot">
          <span className="ac-cta">
            {aisle.cta} <ArrowRight />
          </span>
          <span className="ac-go" aria-hidden="true">
            <ArrowRight />
          </span>
        </div>
      </div>

      {/* whole-card link overlay */}
      <Link className="ac-link" href={aisle.href} aria-label={`${aisle.cta} — ${aisle.name}`} />
    </article>
  );
}

/* ---------- the page ---------- */

export default function Aisles({ aisles, totals }: AislesProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const mastheadRef = useRef<HTMLElement>(null);
  const stampRef = useRef<HTMLSpanElement>(null);

  const realAisles = aisles.filter((a) => !a.dark);
  const hasCategories = realAisles.length > 0;

  /* count-up on scroll into view (hydration-safe: mutates after mount) */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const els = grid.querySelectorAll<HTMLElement>(".ac-count[data-count]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => (el.textContent = el.dataset.count || "0"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          io.unobserve(en.target);
          const el = en.target as HTMLElement;
          const target = parseInt(el.dataset.count || "0", 10);
          const t0 = performance.now();
          const D = 1200;
          const step = (t: number) => {
            const k = Math.min(1, (t - t0) / D);
            const e = 1 - Math.pow(1 - k, 3);
            el.textContent = String(Math.round(target * e));
            if (k < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.6 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [aisles]);

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

  const aisleNote = hasCategories
    ? `${totals.categories} ${totals.categories === 1 ? "shelf" : "shelves"}, one stone oven, zero freezers — every aisle leads straight through to the full board.`
    : "One stone oven, zero freezers — the whole board is open while the aisles get stocked.";

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
              <span aria-current="page">Categories</span>
            </nav>
            <div className="mh-right">
              <p className="mh-live">
                <b>{totals.products}</b> {totals.products === 1 ? "bake" : "bakes"} ·{" "}
                <b>{totals.categories}</b> {totals.categories === 1 ? "aisle" : "aisles"} · one stone oven
              </p>
            </div>
          </div>

          <div className="mh-titlerow">
            <h1 className="mh-title" data-reveal>
              Shop by <em>craving.</em>
              <span className="mh-spark" aria-hidden="true"><SparkSvg /></span>
            </h1>

            <span className="mh-stamp" ref={stampRef} aria-hidden="true">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="56" fill="#FFFDF6" stroke="#26180E" strokeWidth="2.5" />
                <circle cx="60" cy="60" r="33" fill="none" stroke="#26180E" strokeWidth="1.5" strokeDasharray="2 6" opacity=".5" />
                <defs>
                  <path id="stampPathCats" d="M60 60 m-45 0 a45 45 0 1 1 90 0 a45 45 0 1 1 -90 0" />
                </defs>
                <text className="mh-stamp-text">
                  <textPath href="#stampPathCats">AYOOB BAKERY · SHOP BY CRAVING · DANDENONG NORTH · EST 1952 ·</textPath>
                </text>
                <g stroke="#26180E" strokeWidth="2.4" strokeLinecap="round" fill="none">
                  <path d="M60 46v30" />
                  <path d="M60 53l-8-8M60 53l8-8M60 63l-8-8M60 63l8-8M60 46q1-7 7-9" />
                </g>
              </svg>
            </span>
          </div>
        </div>
      </section>

      {/* ============ THE AISLES ============ */}
      <section id="aisles" className="aisles-sec">
        <div className="wrap">
          <div className="acgrid" ref={gridRef}>
            {/* no categories yet → honest empty state */}
            {!hasCategories && (
              <div className="ac ac--full ac--empty" data-reveal>
                <div className="ac-empty-in">
                  <span className="ring"><Wheat /></span>
                  <b>The aisles are being stocked</b>
                  <p>
                    Categories are on their way — the whole board is already open, warm and waiting.
                  </p>
                  <Link className="btn btn-ghost btn-sm" href="/products">
                    Browse the board
                  </Link>
                </div>
              </div>
            )}

            {aisles.map((a, i) => (
              <AisleCard key={a._id} aisle={a} index={hasCategories ? i : i - 1 < 0 ? 0 : i - 1} />
            ))}
          </div>

          <p className="aisle-note" data-reveal>{aisleNote}</p>

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
                <span>$6 flat within 8 km of Dandenong North, free over $50, same morning.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}