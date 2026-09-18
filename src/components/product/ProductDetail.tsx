"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Activity,
  BadgeCheck,
  Bike,
  Check,
  ChevronRight,
  Clock,
  CreditCard,
  Flame,
  Heart,
  HeartOff,
  Loader2,
  Lock,
  MapPin,
  Minus,
  Package,
  Phone,
  Plus,
  Send,
  Share2,
  Timer,
  Trash2,
  Wheat,
  X,
} from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { money, stripHtml } from "@/lib/format";
import { copyText } from "@/lib/clipboard";
import { flyToCart } from "@/lib/flyToCart";
import { getStatus } from "@/lib/hours";

/* ---------- types ---------- */

export interface DetailReview {
  _id?: string;
  userId?: string | null;
  user: string;
  comment: string;
  rating: number;
  date: string;
}

export interface DetailProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  unit: string;
  discount: number;
  badge: string;
  shortDescription: string;
  description: string;
  ingredients: string;
  nutrition: string;
  options: { name: string; values: { value: string; price: number }[] }[];
  ratings: number;
  salesCount: number;
  reviews: DetailReview[];
  category: { _id: string; name: string };
}

interface ProductDetailProps {
  product: DetailProduct;
  related: any[];
}

/* ---------- helpers ---------- */

const UNITS: Record<string, string> = { quantity: "each", kg: "/ kg", lb: "/ lb" };
const unitLabel = (u: string) => UNITS[u] ?? "each";
const plu = (n: number) => (n === 1 ? "" : "s");

function timeAgo(dateStr: string): string {
  const days = Math.max(0, Math.round((Date.now() - new Date(dateStr).getTime()) / 864e5));
  if (days < 1) return "today";
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (days < 30) { const w = Math.round(days / 7); return `${w} week${w === 1 ? "" : "s"} ago`; }
  if (days < 365) { const m = Math.round(days / 30); return `${m} month${m === 1 ? "" : "s"} ago`; }
  const y = Math.round(days / 365); return `${y} year${y === 1 ? "" : "s"} ago`;
}

function Stars({ avg, size = 17 }: { avg: number; size?: number }) {
  const full = Math.round(avg);
  return (
    <span className="stars" style={{ ["--starsize" as string]: `${size}px` }} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={i <= full ? "" : "dim"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

function StampSvg() {
  return (
    <svg viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="56" fill="#FFFDF6" stroke="#26180E" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="33" fill="none" stroke="#26180E" strokeWidth="1.5" strokeDasharray="2 6" opacity=".5" />
      <defs>
        <path id="pdStampPath" d="M60 60 m-45 0 a45 45 0 1 1 90 0 a45 45 0 1 1 -90 0" />
      </defs>
      <text className="pd-stamp-text">
        <textPath href="#pdStampPath">AYOOB BAKERY · BAKED THIS MORNING · BRUNSWICK ·</textPath>
      </text>
      <g stroke="#26180E" strokeWidth="2.4" strokeLinecap="round" fill="none">
        <path d="M60 46v30" />
        <path d="M60 53l-8-8M60 53l8-8M60 63l-8-8M60 63l8-8M60 46q1-7 7-9" />
      </g>
    </svg>
  );
}

/* ---------- the gallery stage (flour canvas + real image) ---------- */

function Gallery({
  product,
  inCartQty,
  isFav,
  onFav,
  onShare,
  onBoing,
  stageRef,
}: {
  product: DetailProduct;
  inCartQty: number;
  isFav: boolean;
  onFav: () => void;
  onShare: () => void;
  onBoing: (e: React.MouseEvent) => void;
  stageRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [view, setView] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const images = product.images?.length ? product.images : [];
  const current = images[view];
  const hasDiscount = product.discount > 0;

  /* flour dust — drifts, flees the pointer, bursts on click */
  useEffect(() => {
    const stage = stageRef.current;
    const cv = canvasRef.current;
    if (!stage || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cw = 0, ch = 0;
    let fmx = -9999, fmy = -9999;
    type P = { x: number; y: number; r: number; spd: number; sw: number; sspd: number; vx: number; vy: number; a: number; c: string; life?: number };
    let ps: P[] = [];

    const size = () => {
      const r = stage.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = r.width * dpr;
      cv.height = r.height * dpr;
      cw = r.width; ch = r.height;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const seed = () => {
      ps = [];
      const n = Math.min(46, Math.round((cw || 400) / 9));
      for (let i = 0; i < n; i++) {
        const roll = Math.random();
        ps.push({
          x: Math.random() * (cw || 400), y: Math.random() * (ch || 380),
          r: 0.9 + Math.random() * 2.4, spd: 0.08 + Math.random() * 0.22,
          sw: Math.random() * 6.28, sspd: 0.006 + Math.random() * 0.012,
          vx: 0, vy: 0, a: 0.08 + Math.random() * 0.16,
          c: roll > 0.85 ? "#C4551E" : roll > 0.72 ? "#E7A23B" : "#26180E",
        });
      }
    };

    size(); seed();
    const onResize = () => { size(); seed(); };
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      fmx = e.clientX - r.left; fmy = e.clientY - r.top;
    };
    const onLeave = () => { fmx = -9999; fmy = -9999; };
    window.addEventListener("resize", onResize);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);

    let raf = 0;

    /* PHASE 5: stop the loop ENTIRELY while the gallery is scrolled
       out of view — previously the flour dust kept animating invisibly
       for the whole life of the page (reviews, facts, related…). It
       resumes the moment the gallery scrolls back in. */
    let inView = true;
    const io = new IntersectionObserver(
      (en) => {
        inView = en[0].isIntersecting;
        if (inView) {
          if (!raf) raf = requestAnimationFrame(draw);
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 }
    );

    const draw = () => {
      if (!RM && !document.hidden && inView) {
        ctx.clearRect(0, 0, cw, ch);
        for (let i = ps.length - 1; i >= 0; i--) {
          const p = ps[i];
          if (p.life !== undefined) {
            p.life -= 0.025;
            if (p.life <= 0) { ps.splice(i, 1); continue; }
            p.a = p.life * 0.3;
          }
          const dx = p.x - fmx, dy = p.y - fmy, d2 = dx * dx + dy * dy;
          if (fmx > -9000 && d2 < 12100) {
            const d = Math.sqrt(d2) || 1, f = (1 - d / 110) * 1.8;
            p.vx += (dx / d) * f; p.vy += (dy / d) * f;
          }
          p.sw += p.sspd;
          p.x += p.vx + Math.sin(p.sw) * 0.3;
          p.y += p.vy + p.spd;
          p.vx *= 0.9; p.vy *= 0.9;
          if (p.y > ch + 10) { p.y = -8; p.x = Math.random() * cw; }
          if (p.x > cw + 10) p.x = -8;
          if (p.x < -10) p.x = cw + 8;
          ctx.globalAlpha = p.a; ctx.fillStyle = p.c;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    io.observe(stage);

    /* expose a burst for stage clicks */
    (stage as HTMLDivElement & { __burst?: () => void }).__burst = () => {
      if (RM) return;
      const cx = cw / 2, cy = ch / 2;
      for (let i = 0; i < 16; i++) {
        const a = Math.random() * 6.28, s = 1.2 + Math.random() * 2.6;
        ps.push({
          x: cx, y: cy, r: 1 + Math.random() * 2, spd: 0, sw: 0, sspd: 0,
          vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1,
          a: 0.3, c: Math.random() > 0.7 ? "#C4551E" : "#26180E", life: 1,
        });
      }
    };

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
    };
  }, [stageRef]);

  const switchView = (i: number) => {
    setView(i);
    const img = stageRef.current?.querySelector(".pd-illimg");
    if (img && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      img.classList.remove("boing");
      void (img as HTMLElement).offsetWidth;
      img.classList.add("boing");
    }
  };

  return (
    <div className="pd-gallery">
      <div className="pd-stage" ref={stageRef} onClick={onBoing}>
        <canvas ref={canvasRef} aria-hidden="true" />
        <span className="pd-ring" aria-hidden="true" />

        <div className="pd-illwrap">
          {current ? (
            <Image
              src={current}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1080px) 92vw, 560px"
              className="pd-illimg"
            />
          ) : (
            <Wheat className="pd-noimg" aria-hidden="true" />
          )}
        </div>

        {(product.badge || hasDiscount) && (
          <div className="pd-chips">
            {product.badge && <span className="pd-chip">{product.badge}</span>}
            {hasDiscount && (
              <span className="pd-chip pd-chip--off">−{Math.round(product.discount)}% this week</span>
            )}
          </div>
        )}

        <div className="pd-casecta">
          <button
            type="button"
            className={`pd-heart${isFav ? " on" : ""}`}
            onClick={onFav}
            aria-pressed={isFav}
            aria-label={isFav ? `Remove ${product.name} from favourites` : `Save ${product.name} to favourites`}
          >
            <Heart />
          </button>
          <button type="button" className="pd-share" onClick={onShare} aria-label="Share this bake">
            <Share2 />
          </button>
        </div>

        <span className="pd-instamp" aria-hidden="true">
          <b>{inCartQty > 1 ? `${inCartQty}×` : ""}</b> in your order
        </span>
      </div>

      {images.length > 1 && (
        <div className="pd-thumbs" role="group" aria-label="Product images">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              className={`pd-thumb${i === view ? " on" : ""}`}
              onClick={() => switchView(i)}
              aria-label={`View image ${i + 1}`}
            >
              <Image src={img} alt="" fill sizes="76px" className="pt-img" />
            </button>
          ))}
        </div>
      )}

      <div className="pd-rostamp" aria-hidden="true">
        <StampSvg />
      </div>
    </div>
  );
}

/* ---------- the page ---------- */

export default function ProductDetail({ product, related }: ProductDetailProps) {
  const router = useRouter();
  const toast = useToast();
  const { data: session } = useSession();
  const { addToCart, cartItems } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [qty, setQty] = useState(1);
  const [sel, setSel] = useState(0);
  const [status, setStatus] = useState<{ open: boolean; text: string } | null>(null);
  const [stickyOn, setStickyOn] = useState(false);
  const [reviews, setReviews] = useState<DetailReview[]>(product.reviews || []);
  const [posting, setPosting] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  const id = product._id;
  const isFav = isInWishlist(id);

  /* sync reviews when the server re-renders with fresh data */
  useEffect(() => {
    setReviews(product.reviews || []);
  }, [product.reviews]);

  /* live open/closed */
  useEffect(() => {
    const upd = () => setStatus(getStatus());
    upd();
    const t = window.setInterval(upd, 30000);
    return () => window.clearInterval(t);
  }, []);

  /* sticky buy bar — appears once the hero scrolls away */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onScroll = () => {
      setStickyOn(window.scrollY > hero.offsetTop + hero.offsetHeight - 220);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------- pricing (real options[] — group 0 drives price) ---------- */
  const optionGroup = product.options?.[0];
  const selected = optionGroup?.values?.[sel];
  const unitPrice = selected ? selected.price : product.price;
  const hasDiscount = product.discount > 0;
  const effPrice = hasDiscount ? unitPrice * (1 - product.discount / 100) : unitPrice;

  /* ---------- variant-aware cart presence ---------- */
  const curVariant = selected?.value || undefined;
  const inCartQty =
    cartItems.find((i) => i._id === id && (i.variant || undefined) === curVariant)?.quantity ?? 0;

  /* ---------- review summary (from the live list) ---------- */
  const summary = useMemo(() => {
    const n = reviews.length;
    const avg = n ? reviews.reduce((s, r) => s + r.rating, 0) / n : product.ratings || 0;
    return { n, avg: Math.round(avg * 10) / 10 };
  }, [reviews, product.ratings]);

  /* ---------- actions ---------- */

  const cartProduct = { ...product, price: +effPrice.toFixed(2) };

  const add = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    // capture the source BEFORE the await — React nulls event.currentTarget
    // once the handler's synchronous phase ends
    const src: HTMLElement | null = e?.currentTarget ?? addRef.current ?? null;

    await addToCart(cartProduct, qty, selected?.value);
    flyToCart(src, product.images?.[0]);
    toast(
      Check,
      "In your order",
      `${qty} × ${product.name}${selected ? ` · ${selected.value}` : ""} — ${money(effPrice * qty)}`
    );
    setQty(1);
  };

  const onFav = async () => {
    const willBeFav = !isFav;
    await toggleWishlist(id);
    toast(
      willBeFav ? Heart : HeartOff,
      willBeFav ? "Saved to favourites" : "Removed from favourites",
      willBeFav
        ? `${product.name} — we'll keep it warm for you.`
        : `${product.name} is off the list.`
    );
  };

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const ok = await copyText(
      `AYOOB BAKERY — ${product.name} · ${money(effPrice)} ${unitLabel(product.unit)}\n${product.shortDescription}\n${url}`
    );
    if (ok) toast(Check, "Bake shared", "Paste it to whoever needs to know what to bring home.");
    else toast(X, "Copy failed", "Give it one more try.");
  };

  const onBoing = (e: React.MouseEvent) => {
    if ((e.target as Element).closest("button")) return;
    const stage = stageRef.current;
    const img = stage?.querySelector(".pd-illimg");
    if (img && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      img.classList.remove("boing");
      void (img as HTMLElement).offsetWidth;
      img.classList.add("boing");
    }
    (stage as (HTMLDivElement & { __burst?: () => void }) | null)?.__burst?.();
  };

  const desc =
    product.description || product.shortDescription || "Baked this morning at Ayoob Bakery, Brunswick.";

  const d = (s: string) => ({ "--d": s } as React.CSSProperties);

  return (
    <>
      {/* ============ THE SHOWCASE ============ */}
      <section id="hero" className="pd-hero" ref={heroRef}>
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight className="lucide" />
            <Link href="/products">The board</Link>
            <ChevronRight className="lucide" />
            <Link href={`/products?category=${product.category?._id}`}>{product.category?.name}</Link>
            <ChevronRight className="lucide" />
            <span aria-current="page">{product.name}</span>
          </nav>

          <div className="pd-grid">
            <Gallery
              product={product}
              inCartQty={inCartQty}
              isFav={isFav}
              onFav={onFav}
              onShare={onShare}
              onBoing={onBoing}
              stageRef={stageRef}
            />

            {/* the buy column */}
            <div className="pd-info" id="buy">
              <p className="kicker">
                <span className="k-rule" />
                <Link href={`/products?category=${product.category?._id}`} className="kicker-link">
                  The board · {product.category?.name}
                </Link>
              </p>
              <h1 className="pd-title">{product.name}</h1>

              <div className="pd-rating">
                <Stars avg={summary.avg} />
                <a href="#reviews">
                  {summary.avg.toFixed(1)} ·{" "}
                  {summary.n ? `${summary.n} review${plu(summary.n)}` : "no reviews yet"}
                </a>
                {product.salesCount > 0 && (
                  <span className="sold">{product.salesCount.toLocaleString("en-AU")} sold</span>
                )}
              </div>

              {product.shortDescription && <p className="pd-short">{product.shortDescription}</p>}

              <div className="pd-pricerow">
                <span className="pd-price">{money(effPrice)}</span>
                {hasDiscount && <s className="pd-was">{money(unitPrice)}</s>}
                {hasDiscount && <span className="pd-save">save {money(unitPrice - effPrice)}</span>}
                <span className="pd-unit">{unitLabel(product.unit)}</span>
              </div>

              {optionGroup && optionGroup.values.length > 0 && (
                <div className="pd-opts">
                  <div>
                    <span className="opt-k">{optionGroup.name}</span>
                    <div className="opt-pills">
                      {optionGroup.values.map((v, i) => (
                        <button
                          key={i}
                          type="button"
                          className={`opt-pill${i === sel ? " on" : ""}`}
                          onClick={() => setSel(i)}
                        >
                          {v.value}{" "}
                          <b>{money(hasDiscount ? v.price * (1 - product.discount / 100) : v.price)}</b>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="pd-buyrow">
                <div className="pd-stepper">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    aria-label="One less"
                  >
                    <Minus />
                  </button>
                  <b>{qty}</b>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(99, q + 1))}
                    disabled={qty >= 99}
                    aria-label="One more"
                  >
                    <Plus />
                  </button>
                </div>
                <button
                  ref={addRef}
                  className="btn btn-primary pd-add"
                  type="button"
                  onClick={() => add()}
                >
                  Add{selected ? ` — ${selected.value}` : ""} — {money(effPrice * qty)} <Plus />
                </button>
              </div>

              <div className="pd-sub">
                <span className="pd-subnote">
                  <Wheat /> baked this morning · pick-up only from 312 Lygon St
                </span>
                {inCartQty > 0 && (
                  <Link href="/cart" className="pd-vieworder">
                    review your order
                  </Link>
                )}
              </div>

              <div className="pd-trust">
                <span><Flame /> baked this morning</span>
                <span><Timer /> pickup in ~20 min</span>
                <span><Package /> paper, never plastic</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ THE FACTS ============ */}
      <section id="facts" className="sec sec--tint">
        <div className="wrap">
          <header className="sec-head">
            <div>
              <p className="kicker" data-reveal>
                <span className="k-no">01</span>
                <span className="k-rule" />
                <span>The details</span>
              </p>
              <h2 data-reveal style={d(".08s")}>
                Nothing <em>hidden.</em>
              </h2>
            </div>
            <p className="sec-note" data-reveal style={d(".16s")}>
              The long version of the label — what&rsquo;s in it, what&rsquo;s in it for you, and how
              it gets to your table.
            </p>
          </header>

          <div className="pd-desc-block" data-reveal>
            <p className="lead">{desc}</p>
          </div>

          <div className="facts-grid">
            <div className="fact-card" data-reveal aria-label="Ingredients">
              <div className="fc2-head">
                <span className="fc-ico"><Wheat /></span>
                <h3>Ingredients</h3>
              </div>
              {product.ingredients ? (
                <p className="preline">{product.ingredients}</p>
              ) : (
                <p>
                  The counter can tell you exactly what&rsquo;s in this one — one kitchen, one oven,
                  and we like the question.
                </p>
              )}
              <p className="fact-note">
                One kitchen, one oven — gluten, dairy, eggs and nuts all in daily rotation. Ask
                before you order; we like the question.
              </p>
            </div>

            <div className="fact-card" data-reveal style={d(".08s")} aria-label="Nutrition">
              <div className="fc2-head">
                <span className="fc-ico"><Activity /></span>
                <h3>Nutrition</h3>
              </div>
              {product.nutrition ? (
                <p className="preline">{product.nutrition}</p>
              ) : (
                <p>Nutritional information for this bake lives at the counter — ask and we&rsquo;ll walk you through it.</p>
              )}
            </div>

            <div className="fact-card" data-reveal style={d(".16s")} aria-label="Pick-up and delivery">
              <div className="fc2-head">
                <span className="fc-ico"><Bike /></span>
                <h3>Pick-up &amp; delivery</h3>
              </div>
              <div className="fact-row"><MapPin /><span><b>Pick-up only</b> — 312 Lygon Street, Brunswick (tram 19, stop 22).</span></div>
              <div className="fact-row"><Timer /><span>Wrapped and waiting in <b>about 20 minutes</b> from your call.</span></div>
              <div className="fact-row"><CreditCard /><span>Pay at the counter — <b>card, cash, EFTPOS</b>.</span></div>
              <div className="fact-row"><Clock /><span>Orders after 2 pm roll to the <b>next morning&rsquo;s bake</b>.</span></div>
              {status && (
                <div className={`status-pill${status.open ? "" : " closed"}`}>
                  <span className="pulse" />
                  <span className="st-text">{status.text}</span>
                </div>
              )}
              <div className="fact-cta">
                <a className="btn btn-primary btn-sm" href="tel:+61393872196">
                  <Phone /> Call to order
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ REVIEWS ============ */}
      <ReviewsSection
        product={product}
        reviews={reviews}
        setReviews={setReviews}
        summary={summary}
        session={session}
        posting={posting}
        setPosting={setPosting}
        router={router}
        toast={toast}
      />

      {/* ============ RELATED ============ */}
      <section id="related" className="sec sec--tint">
        <div className="wrap">
          <header className="sec-head">
            <div>
              <p className="kicker" data-reveal>
                <span className="k-no">03</span>
                <span className="k-rule" />
                <span>Same aisle · {product.category?.name}</span>
              </p>
              <h2 data-reveal style={d(".08s")}>
                The rest of <em>the table.</em>
              </h2>
            </div>
            <p className="sec-note" data-reveal style={d(".16s")}>
              Baked in the same morning, out of the same oven — tap a card to see its page.
            </p>
          </header>

          <div className="rel-grid">
            {related.map((p, i) => (
              <ProductCard key={String(p._id)} product={p} index={i} />
            ))}
          </div>

          <p className="board-note" data-reveal>
            Prices in AUD · everything wrapped in paper, never plastic · sold-out lines reset at 6:30 am.
          </p>
        </div>
      </section>

      {/* ============ STICKY BUY BAR ============ */}
      <div className={`stickybar${stickyOn ? " on" : ""}`}>
        <span className="sb-thumb">
          {product.images?.[0] ? (
            <Image src={product.images[0]} alt="" fill sizes="44px" className="sb-img" />
          ) : (
            <Wheat />
          )}
        </span>
        <div className="sb-main">
          <b>{product.name}{selected ? ` · ${selected.value}` : ""}</b>
          <span>{money(effPrice)} {unitLabel(product.unit)}</span>
        </div>
        <div className="sb-stepper">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="One less">
            <Minus />
          </button>
          <b>{qty}</b>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            disabled={qty >= 99}
            aria-label="One more"
          >
            <Plus />
          </button>
        </div>
        <button className="btn btn-primary btn-sm sb-add" type="button" onClick={(e) => add(e)}>
          Add{qty > 1 ? ` ${qty}` : ""} — {money(effPrice * qty)}
        </button>
      </div>
    </>
  );
}

/* ---------- the reviews section (real API) ---------- */

function ReviewsSection({
  product,
  reviews,
  setReviews,
  summary,
  session,
  posting,
  setPosting,
  router,
  toast,
}: {
  product: DetailProduct;
  reviews: DetailReview[];
  setReviews: React.Dispatch<React.SetStateAction<DetailReview[]>>;
  summary: { n: number; avg: number };
  session: any;
  posting: boolean;
  setPosting: (v: boolean) => void;
  router: ReturnType<typeof useRouter>;
  toast: ReturnType<typeof useToast>;
}) {
  const [picked, setPicked] = useState(0);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [err, setErr] = useState<{ star?: string; name?: string; text?: string }>({});
  const [deleting, setDeleting] = useState<string | null>(null);

  const myUserId = session?.user?.id ? String(session.user.id) : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof err = {};
    if (!picked) errs.star = "Pick a star rating — one tap, honest taps.";
    if (!session && name.trim().length < 2) errs.name = "Tell us who's talking — the counter likes a name.";
    if (text.trim().length < 10) errs.text = "Give us a little more than that — ten characters, minimum.";
    setErr(errs);
    if (errs.star || errs.name || errs.text) return;

    setPosting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          rating: picked,
          comment: text.trim(),
          reviewerName: session ? undefined : name.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "");
      }
      /* optimistic prepend + background sync */
      setReviews((prev) => [
        {
          user: session?.user?.name || name.trim(),
          userId: myUserId ?? null,
          rating: picked,
          comment: text.trim(),
          date: new Date().toISOString(),
        },
        ...prev,
      ]);
      setPicked(0);
      setName("");
      setText("");
      toast(Check, "Review posted", "Thank you — it's at the top of the pile.");
      router.refresh();
    } catch (err: any) {
      toast(X, "Couldn't post that", err?.message || "Check your connection and try again.");
    } finally {
      setPosting(false);
    }
  };

  const del = async (reviewId: string) => {
    if (!confirm("Remove your review?")) return;
    setDeleting(reviewId);
    try {
      const res = await fetch("/api/reviews/manage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id, reviewId }),
      });
      if (!res.ok) throw new Error();
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      toast(Trash2, "Review removed", "The counter holds no grudges.");
      router.refresh();
    } catch {
      toast(X, "Couldn't remove that", "Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <section id="reviews" className="sec">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <p className="kicker" data-reveal>
              <span className="k-no">02</span>
              <span className="k-rule" />
              <span>Word of mouth</span>
            </p>
            <h2 data-reveal style={{ "--d": ".08s" } as React.CSSProperties}>
              On <em>&ldquo;{product.name}.&rdquo;</em>
            </h2>
          </div>
          <p className="sec-note" data-reveal style={{ "--d": ".16s" } as React.CSSProperties}>
            Ratings and reviews from the board — read them, then add yours below.
          </p>
        </header>

        <div className="rev-grid">
          <div className="rev-left">
            <div className="rev-sum" data-reveal>
              <div className="rev-sum-top">
                <span className="rev-big">{summary.avg.toFixed(1)}</span>
                <div className="rev-sum-stars">
                  <Stars avg={summary.avg} />
                  <span>from {summary.n || 0} review{plu(summary.n)}</span>
                </div>
              </div>
              <p className="rev-sum-note">
                <b>{product.name}</b>
                {product.salesCount > 0 && (
                  <> — <b>{product.salesCount.toLocaleString("en-AU")} sold</b> on this board.</>
                )}{" "}
                Reviews from people who bought it; add yours below.
              </p>
            </div>

            {/* the notepad — add your review */}
            <div className="notepad" data-reveal style={{ "--d": ".08s" } as React.CSSProperties} aria-label="Add a review">
              <div className="pad-head">
                <h3>Add your review</h3>
                <span className="pad-no">no. 0312</span>
              </div>
              <div className="pad-body">
                <form onSubmit={submit} noValidate>
                  <span className="f-k">Your rating</span>
                  <div className="star-pick" role="group" aria-label="Star rating">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        className={i <= picked ? "on" : ""}
                        onClick={() => { setPicked(i); setErr((e) => ({ ...e, star: undefined })); }}
                        aria-label={`${i} star${i === 1 ? "" : "s"}`}
                      >
                        <svg viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  {err.star && <p className="f-err show">{err.star}</p>}

                  {!session && (
                    <div className="field">
                      <label className="f-k" htmlFor="revName">Your name</label>
                      <input
                        id="revName"
                        className="rv-in"
                        type="text"
                        autoComplete="name"
                        placeholder="Ayoob"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      {err.name && <p className="f-err show">{err.name}</p>}
                    </div>
                  )}

                  <div className="field">
                    <div className="mrow">
                      <label className="f-k" htmlFor="revText" style={{ margin: 0 }}>Your review</label>
                      <span className="mcount">{text.length} / 500</span>
                    </div>
                    <textarea
                      id="revText"
                      className="rv-in"
                      rows={4}
                      maxLength={500}
                      placeholder="Honest, please — the counter can take it."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                    {err.text && <p className="f-err show">{err.text}</p>}
                  </div>

                  <button className="btn btn-primary" type="submit" disabled={posting}>
                    {posting ? <Loader2 className="spin" /> : (<>Post the review <Send /></>)}
                  </button>
                  <p className="pad-trust">
                    <Lock /> Reviews are tied to your account when you&rsquo;re signed in — edit and remove anytime.
                  </p>
                </form>
              </div>
            </div>
          </div>

          {/* the list */}
          <div className="rev-list" data-reveal style={{ "--d": ".05s" } as React.CSSProperties}>
            {reviews.length ? (
              reviews.map((r, i) => {
                const mine = r.userId && myUserId && String(r.userId) === myUserId;
                return (
                  <div className={`rev-card${mine ? " rev-mine" : ""}`} style={{ "--d": `${i * 50}ms` } as React.CSSProperties} key={r._id || i}>
                    <div className="rev-top">
                      <span className="rev-av">{(r.user || "?").charAt(0).toUpperCase()}</span>
                      <div className="rev-who">
                        <b>{r.user}</b>
                        <span>{r.date ? timeAgo(r.date) : "recently"}</span>
                      </div>
                      <span className="rev-side">
                        <Stars avg={r.rating} size={14} />
                        {mine && r._id && (
                          <button
                            type="button"
                            className="rev-del"
                            onClick={() => del(r._id!)}
                            disabled={deleting === r._id}
                            aria-label="Remove your review"
                          >
                            {deleting === r._id ? <Loader2 className="spin" /> : <Trash2 />}
                          </button>
                        )}
                      </span>
                    </div>
                    <p>{r.comment}</p>
                  </div>
                );
              })
            ) : (
              <div className="rev-card">
                <div className="rev-top">
                  <span className="rev-av">?</span>
                  <div className="rev-who">
                    <b>No reviews yet</b>
                    <span>be the first</span>
                  </div>
                </div>
                <p>The counter is waiting for the first honest word on this one — it could be yours.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}