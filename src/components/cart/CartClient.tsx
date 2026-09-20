"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Flame,
  Minus,
  Package,
  Phone,
  Plus,
  ShoppingBag,
  Sparkles,
  Store,
  Timer,
  Trash2,
  Wheat,
  X,
} from "lucide-react";
import { useCart, cartLineKey } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { money } from "@/lib/format";
import { copyText } from "@/lib/clipboard";
import { flyToCart } from "@/lib/flyToCart";
import { getDetailedStatus } from "@/lib/hours";
import type { DetailedStatus } from "@/lib/hours";

export interface CartPoolProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  unit: string;
  discount: number;
  badge: string;
  categoryName: string;
}

interface CartLine {
  _id: string;
  name: string;
  price: number;
  images: string[];
  unit: string;
  quantity: number;
  variant?: string;
}

const UNITS: Record<string, string> = { quantity: "each", kg: "per kg", lb: "per lb" };
const unitLabel = (u: string) => UNITS[u] ?? "each";
const plu = (n: number) => (n === 1 ? "" : "s");

/* where items peek out of the kraft bag (x, y, rotation) in the bag's 200-wide viewBox */
const BAG_SPOTS: Record<number, [number, number, number][]> = {
  0: [],
  1: [[100, 52, 0]],
  2: [[76, 54, -8], [124, 54, 8]],
  3: [[64, 56, -12], [100, 47, 2], [136, 56, 12]],
  4: [[56, 58, -15], [84, 50, -7], [116, 50, 7], [144, 58, 15]],
};

function SparkSvg() {
  return (
    <svg className="mh-spark" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- the kraft bag — fills with whatever's actually in the cart ---------- */
function KraftBag({
  items,
  bagRef,
}: {
  items: CartLine[];
  bagRef: React.RefObject<HTMLSpanElement | null>;
}) {
  const picks = items.slice(0, 4);
  const spots = BAG_SPOTS[picks.length] || [];

  return (
    <span className={`mh-bag${picks.length ? "" : " empty"}`} ref={bagRef} data-depth="10" aria-hidden="true">
      <svg className="bag-ill" viewBox="0 0 200 232">
        <defs>
          {picks.map((p, i) => (
            <clipPath id={`bagclip-${i}`} key={i}>
              <circle cx="60" cy="60" r="56" />
            </clipPath>
          ))}
        </defs>

        {/* handles */}
        <path d="M64 62 C64 12 136 12 136 62" fill="none" stroke="#26180E" strokeWidth="6" strokeLinecap="round" />
        <path d="M70 60 C70 22 130 22 130 60" fill="none" stroke="#C97E3F" strokeWidth="3" strokeLinecap="round" opacity=".5" />

        {/* the peek — real product photos poking out of the bag */}
        <g>
          {picks.map((p, i) => {
            const [x, y, r] = spots[i];
            return (
              <g key={p._id} transform={`translate(${x - 30} ${y - 30}) scale(.5)`}>
                <g className="bag-item-in" style={{ "--i": i } as React.CSSProperties}>
                  <g transform={`rotate(${r} 60 60)`}>
                    <g clipPath={`url(#bagclip-${i})`}>
                      {p.images?.[0] ? (
                        <image
                          href={p.images[0]}
                          x="2" y="2" width="116" height="116"
                          preserveAspectRatio="xMidYMid slice"
                        />
                      ) : (
                        <circle cx="60" cy="60" r="56" fill="#EFE6D2" />
                      )}
                    </g>
                    <circle cx="60" cy="60" r="56" fill="none" stroke="#26180E" strokeWidth="4" />
                  </g>
                </g>
              </g>
            );
          })}
        </g>

        {/* the bag (drawn after the peek, so items sit inside it) */}
        <path d="M44 60 L156 60 L166 198 Q167 210 154 210 L46 210 Q33 210 34 198 Z" fill="#C97E3F" stroke="#26180E" strokeWidth="4" strokeLinejoin="round" />
        <path d="M44 60 L156 60 L159 88 L41 88 Z" fill="#B06E33" stroke="#26180E" strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M41 88 L159 88" stroke="#26180E" strokeWidth="2" strokeDasharray="2 6" opacity=".5" />
        <path d="M60 92 L57 204 M140 92 L143 204" stroke="#26180E" strokeWidth="2" opacity=".18" />
        <rect x="60" y="118" width="80" height="58" rx="9" fill="none" stroke="#26180E" strokeWidth="2.5" strokeDasharray="3 6" opacity=".85" />
        <text x="100" y="146" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontWeight="700" fontSize="16" letterSpacing="3" fill="#26180E">AYOOB</text>
        <path d="M100 156v14M100 160l-5-5M100 160l5-5M100 166l-4-4M100 166l4-4" stroke="#26180E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export default function CartClient({ pool }: { pool: CartPoolProduct[] }) {
  const { cartItems, cartCount, cartTotal, cartReady, addToCart, updateQuantity, removeItem, clearCart } = useCart();
  const toast = useToast();

  const [note, setNote] = useState("");
  const [exiting, setExiting] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<DetailedStatus | null>(null);

  const bagRef = useRef<HTMLSpanElement>(null);
  const prevCount = useRef(-1);
  const mastheadRef = useRef<HTMLElement>(null);

  /* ---------- the note for the counter — persists locally with the order ---------- */
  useEffect(() => {
    try { setNote(localStorage.getItem("ayoob-cart-note") || ""); } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("ayoob-cart-note", note); } catch {}
  }, [note]);

  /* ---------- live open/closed (Melbourne time) ---------- */
  useEffect(() => {
    const upd = () => setStatus(getDetailedStatus());
    upd();
    const t = window.setInterval(upd, 30000);
    return () => window.clearInterval(t);
  }, []);

  /* ---------- the bag pops whenever the count changes ---------- */
  useEffect(() => {
    if (prevCount.current === -1) { prevCount.current = cartCount; return; }
    if (prevCount.current !== cartCount && bagRef.current) {
      const b = bagRef.current;
      b.classList.remove("pop");
      void b.offsetWidth;
      b.classList.add("pop");
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  /* ---------- mobile checkout bar: lift the toasts above it ---------- */
  useEffect(() => {
    document.body.classList.toggle("mbar-on", cartCount > 0);
    return () => document.body.classList.remove("mbar-on");
  }, [cartCount]);

  /* ---------- masthead bag parallax (fine pointers, motion-safe) ---------- */
  useEffect(() => {
    const mast = mastheadRef.current;
    if (!mast) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const layers = Array.from(mast.querySelectorAll<HTMLElement>("[data-depth]"))
      .map((el) => ({ el, d: parseFloat(el.dataset.depth || "0"), x: 0, y: 0 }));
    let nx = 0, ny = 0, raf = 0;
    const onMove = (e: PointerEvent) => {
      nx = (e.clientX / window.innerWidth - 0.5) * 2;
      ny = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const tick = () => {
      for (const l of layers) {
        l.x += (nx * l.d - l.x) * 0.07;
        l.y += (ny * l.d - l.y) * 0.07;
        l.el.style.transform = `translate(${l.x.toFixed(1)}px,${l.y.toFixed(1)}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    mast.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      mast.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* ---------- derived ---------- */
  const poolMap = useMemo(() => new Map(pool.map((p) => [p._id, p])), [pool]);

  const mood = cartCount === 0
    ? "waiting to be filled."
    : cartCount <= 2 ? "off to a good start."
    : cartCount <= 5 ? "filling up nicely."
    : "ready for the counter.";

  /* "goes well with" — prefers aisles you haven't touched, bestsellers boosted */
  const crossSell = useMemo(() => {
    if (!cartItems.length) return [];
    const inCart = new Set(cartItems.map((i) => i._id));
    const haveCats = new Set(
      cartItems.map((i) => poolMap.get(i._id)?.categoryName).filter(Boolean) as string[]
    );
    const score = (p: CartPoolProduct) =>
      (p.categoryName && !haveCats.has(p.categoryName) ? 2 : 0) + (p.badge === "Bestseller" ? 1 : 0);
    return pool
      .filter((p) => !inCart.has(p._id))
      .sort((a, b) => score(b) - score(a))
      .slice(0, 3);
  }, [cartItems, pool, poolMap]);

  const quickAdds = pool.slice(0, 3); // server-curated: bestsellers first

  const statusText = status
    ? status.open
      ? `Open now · closes ${status.closesAt}`
      : status.backAt ? `Closed · opens ${status.backAt}` : "Closed"
    : "Checking the oven clock…";

  /* ---------- actions ---------- */

  const addFromPool = async (p: CartPoolProduct, e: React.MouseEvent<HTMLButtonElement>) => {
    await addToCart(p, 1);
    flyToCart(e.currentTarget, p.images?.[0]);
    toast(Check, "Added to cart", `${p.name} — ${money(p.price)}`);
  };

  /* remove a whole line — collapse animation, then removal, with undo */
  const removeLine = async (item: CartLine) => {
    if (exiting.has(item._id)) return;
    const doIt = async () => {
      await removeItem(item._id, item.variant);
      setExiting((prev) => { const n = new Set(prev); n.delete(item._id); return n; });
      toast(Trash2, "Removed from order", `${item.name} — no hard feelings.`, {
        label: "Undo",
        fn: async () => {
          await addToCart(item, item.quantity, item.variant);
          toast(Check, "Back in the order", `${item.name} returned to the slip.`);
        },
      });
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      await doIt();
      return;
    }
    setExiting((prev) => new Set(prev).add(item._id));
    window.setTimeout(doIt, 270);
  };

  const step = (item: CartLine, dir: number) => {
    if (dir < 0 && item.quantity <= 1) {
      removeLine(item);
      return;
    }
    updateQuantity(item._id, item.quantity + dir, item.variant);
  };

  const onClear = () => {
    if (!cartItems.length) return;
    clearCart();
    toast(Trash2, "Order emptied", "Fresh start — the board is yours.");
  };

  const copyOrder = async (okTitle: string, okMsg: string) => {
    if (!cartItems.length) {
      toast(ShoppingBag, "Nothing to copy yet", "Pick a few bakes first — the slip is right here.");
      return;
    }
    const lines = ["AYOOB BAKERY — ORDER", "----------------------------"];
    cartItems.forEach((r) => lines.push(`${r.quantity} x ${r.name} — ${money(r.price * r.quantity)}`));
    lines.push("----------------------------");
    lines.push(`Items: ${cartCount}`);
    lines.push(`Total: ${money(cartTotal)}`);
    if (note.trim()) lines.push(`Note: ${note.trim()}`);
    lines.push("Pick-up: 312 Lygon Street, Melbourne VIC · ready in ~20 minutes");
    lines.push("Call to confirm: 0473 621 594");
    const ok = await copyText(lines.join("\n"));
    if (ok) toast(Check, okTitle, okMsg);
    else toast(X, "Copy failed", "Give it one more try.");
  };

  /* status-aware: phone when open, copy-for-tomorrow when closed */
  const callAction = () => {
    if (!cartItems.length) {
      toast(ShoppingBag, "Nothing to order yet", "Pick a few bakes first — the slip is right here.");
      return;
    }
    if (status?.open) window.location.href = "tel:+61473621594";
    else copyOrder("Order copied", "Paste it anywhere — ring us when we open and it's yours.");
  };

  const loading = !cartReady;
  const empty = cartItems.length === 0;
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
              <span aria-current="page">Your order</span>
            </nav>
            <p className="mh-live" aria-live="polite">
              <b>{cartCount}</b> {cartCount === 1 ? "item" : "items"} · <b>{money(cartTotal)}</b> · pick-up only
            </p>
          </div>

          <div className="mh-titlerow">
            <h1 className="mh-title">
              Your order, <em>{mood}</em>
              <SparkSvg />
            </h1>
            <KraftBag items={cartItems} bagRef={bagRef} />
          </div>
        </div>
      </section>

      {/* ============ THE SLIP + THE TALLY ============ */}
      <section id="slip" className="cart-sec">
        <div className="wrap">
          <div className="cart-grid">
            {/* the order slip */}
            <div className="slip" aria-label="Your order slip">
              <div className="slip-head">
                <h2>The order slip</h2>
                <span className="slip-no">no. 0312</span>
                <span className="slip-count">
                  {cartCount} {cartCount === 1 ? "item" : "items"}
                </span>
                <button className="slip-clear" type="button" hidden={empty} onClick={onClear}>
                  empty it
                </button>
              </div>

              {loading ? (
                <div className="cart-skel" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <div className="cart-skel-row" key={i} style={d(`${i * 70}ms`)} />
                  ))}
                </div>
              ) : empty ? (
                <div className="emptybox">
                  <span className="ring"><ShoppingBag /></span>
                  <b>Your order is empty</b>
                  <p>
                    It smells better in here once it&rsquo;s full. Pick a couple of regulars below,
                    or wander the whole board.
                  </p>
                  {quickAdds.length > 0 && (
                    <div className="qa-grid">
                      {quickAdds.map((p) => (
                        <div className="qa-row" key={p._id}>
                          <span className="qa-art">
                            {p.images?.[0] ? <img src={p.images[0]} alt="" /> : <Wheat />}
                          </span>
                          <span className="qa-main">
                            <b>{p.name}</b>
                            <span>{money(p.price)} · {unitLabel(p.unit)}</span>
                          </span>
                          <button
                            className="qa-add"
                            type="button"
                            onClick={(e) => addFromPool(p, e)}
                            aria-label={`Add ${p.name} to your order`}
                          >
                            <Plus />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link className="btn btn-primary" href="/products">
                    Browse the whole board <ArrowRight />
                  </Link>
                </div>
              ) : (
                <>
                  {cartItems.map((item, i) => {
                    const badge = poolMap.get(item._id)?.badge;
                    return (
                      <div
                        className={`slip-rowwrap${exiting.has(item._id) ? " out" : ""}`}
                        key={cartLineKey(item)}
                        style={d(`${i * 45}ms`)}
                      >
                        <div>
                          <div className="slip-row">
                            <span className="slip-thumb">
                              {item.images?.[0] ? <img src={item.images[0]} alt="" /> : <Wheat />}
                            </span>
                            <div className="slip-main">
                              <b className="slip-name">
                                {item.name}
                                {badge && <em className="slip-tag">{badge}</em>}
                                {item.variant && <em className="slip-tag">{item.variant}</em>}
                              </b>
                              <span className="slip-unit">
                                {money(item.price)} {unitLabel(item.unit)}
                              </span>
                              <div className="stepper">
                                <button
                                  type="button"
                                  onClick={() => step(item, -1)}
                                  aria-label={`One less ${item.name}`}
                                >
                                  <Minus />
                                </button>
                                <b>{item.quantity}</b>
                                <button
                                  type="button"
                                  onClick={() => step(item, 1)}
                                  disabled={item.quantity >= 99}
                                  aria-label={`One more ${item.name}`}
                                >
                                  <Plus />
                                </button>
                              </div>
                            </div>
                            <div className="slip-right">
                              <span className="slip-linetotal">
                                {money(item.price * item.quantity)}
                              </span>
                              <button
                                className="slip-del"
                                type="button"
                                onClick={() => removeLine(item)}
                                aria-label={`Remove ${item.name} from your order`}
                              >
                                <Trash2 />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {crossSell.length > 0 && (
                    <div className="xwell">
                      <p className="xwell-k"><Sparkles /> goes well with</p>
                      <div className="qa-grid">
                        {crossSell.map((p) => (
                          <div className="qa-row" key={p._id}>
                            <span className="qa-art">
                              {p.images?.[0] ? <img src={p.images[0]} alt="" /> : <Wheat />}
                            </span>
                            <span className="qa-main">
                              <b>{p.name}</b>
                              <span>{money(p.price)} · {unitLabel(p.unit)}</span>
                            </span>
                            <button
                              className="qa-add"
                              type="button"
                              onClick={(e) => addFromPool(p, e)}
                              aria-label={`Add ${p.name} to your order`}
                            >
                              <Plus />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="slip-foot">
                <span>
                  {empty
                    ? "wrapped in paper."
                    : `${cartCount} item${plu(cartCount)} · wrapped in paper.`}
                </span>
              </div>
            </div>

            {/* the tally */}
            <aside className="sum-col" aria-label="Order summary">
              <div className="summary">
                <div className="sum-k">
                  <ShoppingBag />
                  <h2>The tally</h2>
                  <span>pick-up only</span>
                </div>

                <p className="sum-pick">
                  <Store />
                  <span>
                    <b>312 Lygon Street, Melbourne</b> — ready in about 20 minutes from
                    confirmation. We&rsquo;ll have it wrapped and waiting under your name.
                  </span>
                </p>

                <label className="note-k" htmlFor="orderNote">A note for the counter</label>
                <textarea
                  className="note"
                  id="orderNote"
                  rows={2}
                  placeholder="Extra cardamom? A message on the cake box? A dozen cream horns?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />

                <div className="t-row">
                  <span>Items</span>
                  <b>{cartCount} {cartCount === 1 ? "item" : "items"}</b>
                </div>
                <div className="t-row"><span>Subtotal</span><b>{money(cartTotal)}</b></div>
                <div className="t-row t-final"><span>Total</span><b>{money(cartTotal)}</b></div>

                <div className="sum-ctas">
                  <button className="btn btn-primary btn-block" type="button" onClick={callAction} aria-live="polite">
                    {status?.open ? (
                      <><Phone /> Call to order — 0473 621 594</>
                    ) : (
                      <><Clock /> Closed — copy your order for tomorrow</>
                    )}
                  </button>
                  <button
                    className="btn btn-ghost btn-block"
                    type="button"
                    onClick={() => copyOrder("Order copied", "Paste it anywhere — your notes, a message, the fridge.")}
                  >
                    <Copy /> Copy order details
                  </button>
                </div>

                <ul className="sum-trust">
                  <li><Clock /> {statusText}</li>
                  <li><Flame /> Baked this morning — never frozen, never day-old</li>
                  <li><Package /> wrapped in paper</li>
                  <li><CreditCard /> Pay at the counter — card, cash, EFTPOS</li>
                </ul>
              </div>
            </aside>
          </div>

          {/* closing strip */}
          <div className="gstrip" data-reveal>
            <div className="gcell">
              <span className="g-ico"><Flame /></span>
              <div>
                <b>Baked this morning</b>
                <span>Mixed by hand, out of the oven from 8 am — never frozen, never day-old.</span>
              </div>
            </div>
            <div className="gcell">
              <span className="g-ico"><Timer /></span>
              <div>
                <b>Ready in ~20 minutes</b>
                <span>Order by phone or in person — we&rsquo;ll have it wrapped and waiting.</span>
              </div>
            </div>
            <div className="gcell">
              <span className="g-ico"><Package /></span>
              <div>
                <b>Wrapped with care</b>
                <span>Paper, string and a stamp — ready for the table or the bike basket.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ MOBILE CHECKOUT BAR ============ */}
      <div className={`mbar${cartCount > 0 ? " on" : ""}`}>
        <div className="mb-in">
          <p className="mb-meta">
            <b>{money(cartTotal)}</b>
            <span>{cartCount} {cartCount === 1 ? "item" : "items"} · pick-up only</span>
          </p>
          <button className="btn" type="button" onClick={callAction}>
            {status?.open ? <><Phone /> Call to order</> : <><Clock /> Copy order</>}
          </button>
        </div>
      </div>
    </>
  );
}