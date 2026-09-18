"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ChevronRight,
  Phone,
  Search,
  Wheat,
  X,
} from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { scrollToEl } from "@/lib/scroll";

export interface SearchProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  unit: string;
  discount: number;
  badge: string;
  shortDescription: string;
  descriptionPlain: string;
  categoryName: string;
  ratings: number;
}

interface SearchClientProps {
  pool: SearchProduct[];
}

/* all words must match somewhere in the bake's text (AND search) */
function matchQuery(p: SearchProduct, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return false;
  const hay =
    `${p.name} ${p.shortDescription} ${p.descriptionPlain} ${p.categoryName} ${p.badge}`.toLowerCase();
  return needle
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
}

function SparkSvg() {
  return (
    <svg className="mh-spark" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"
        fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"
      />
    </svg>
  );
}

const BADGE_ORDER = ["Bestseller", "New", "Popular", "Featured"];

export default function SearchClient({ pool }: SearchClientProps) {
  const [q, setQ] = useState("");
  const [recents, setRecents] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const mastheadRef = useRef<HTMLElement>(null);
  const stampRef = useRef<HTMLSpanElement>(null);

  /* ---------- derived ---------- */
  const results = useMemo(
    () => (q.trim() ? pool.filter((p) => matchQuery(p, q)) : []),
    [pool, q]
  );

  /* popular chips — real badges + real categories, so every chip has results */
  const popularChips = useMemo(() => {
    const badges = BADGE_ORDER.filter((b) => pool.some((p) => p.badge === b));
    const cats: string[] = [];
    pool.forEach((p) => {
      if (p.categoryName && !cats.includes(p.categoryName)) cats.push(p.categoryName);
    });
    return [...badges, ...cats].slice(0, 7);
  }, [pool]);

  /* "popular right now" — badged bakes by rating, topped up with the newest,
     deduped so no product can appear twice (duplicate React keys) */
  const popularPicks = useMemo(() => {
    const seen = new Set<string>();
    const picks: SearchProduct[] = [];
    const badged = pool
      .filter((p) => ["Bestseller", "Featured", "Popular"].includes(p.badge))
      .sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
    for (const p of badged) {
      if (picks.length >= 8) break;
      if (!seen.has(p._id)) { seen.add(p._id); picks.push(p); }
    }
    if (picks.length < 4) {
      for (const p of pool) {
        if (picks.length >= 8) break;
        if (!seen.has(p._id)) { seen.add(p._id); picks.push(p); }
      }
    }
    return picks;
  }, [pool]);

  /* ---------- recent searches (localStorage, client-only) ---------- */
  const saveRecent = (v: string) => {
    const val = v.trim();
    if (!val) return;
    setRecents((prev) => {
      const next = [val, ...prev.filter((r) => r.toLowerCase() !== val.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem("ayoob-recents", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    try {
      setRecents(JSON.parse(localStorage.getItem("ayoob-recents") || "[]"));
    } catch {}
  }, []);

  /* ---------- PHASE 4: the page is cache-served now — a deep-linked
     ?q= is read from the URL here on mount, instead of arriving as a
     server-injected prop. ---------- */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlQ = params.get("q");
    if (urlQ) setQ(urlQ);
  }, []);

  /* ---------- autofocus (fine pointers only — no mobile keyboard jump) ---------- */
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const el = inputRef.current;
    if (el) {
      el.focus();
      try {
        el.setSelectionRange(el.value.length, el.value.length);
      } catch {}
    }
  }, []);

  /* ---------- keep the URL shareable (replaceState — no history spam) ---------- */
  useEffect(() => {
    const t = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      const qs = params.toString();
      window.history.replaceState(null, "", qs ? `/search?${qs}` : "/search");
    }, 350);
    return () => window.clearTimeout(t);
  }, [q]);

  /* back/forward: sync the query from the URL */
  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(window.location.search);
      setQ(params.get("q") || "");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  /* ---------- commit a search to recents after a quiet pause ---------- */
  useEffect(() => {
    const v = q.trim();
    if (v.length < 3) return;
    if (!pool.some((p) => matchQuery(p, v))) return; // don't remember misses
    const t = window.setTimeout(() => saveRecent(v), 2200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, pool]);

  /* ---------- keyboard: "/" focuses the bar, Esc clears ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== "input" && tag !== "textarea" && tag !== "select") {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- masthead stamp parallax (fine pointers, motion-safe) ---------- */
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

  /* ---------- actions ---------- */
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    if (!v) return;
    saveRecent(v);
    if (resultsRef.current) scrollToEl(resultsRef.current, -20);
  };

  const useChip = (chip: string) => {
    setQ(chip);
    saveRecent(chip);
    if (resultsRef.current) scrollToEl(resultsRef.current, -20);
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (q) setQ("");
      else inputRef.current?.blur();
    }
  };

  const hasQuery = !!q.trim();
  const poolEmpty = pool.length === 0;

  const liveLine = poolEmpty
    ? "the board is being stocked"
    : hasQuery
      ? `${results.length} ${results.length === 1 ? "bake" : "bakes"} match \u201C${q.trim()}\u201D`
      : `${pool.length} bakes · one stone oven`;

  const d = (s: string) => ({ "--d": s } as React.CSSProperties);

  return (
    <>
      {/* ============ COMPACT MASTHEAD — the search bar is the hero ============ */}
      <section id="hero" className="masthead" ref={mastheadRef}>
        <div className="wrap">
          <div className="mh-top">
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <ChevronRight className="lucide" />
              <span aria-current="page">Search</span>
            </nav>
            <p className="mh-live" aria-live="polite">{liveLine}</p>
          </div>

          <div className="mh-titlerow">
            <h1 className="mh-title">
              What are you <em>craving?</em>
              <SparkSvg />
            </h1>

            <span className="mh-stamp" ref={stampRef} aria-hidden="true">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="56" fill="#FFFDF6" stroke="#26180E" strokeWidth="2.5" />
                <circle cx="60" cy="60" r="33" fill="none" stroke="#26180E" strokeWidth="1.5" strokeDasharray="2 6" opacity=".5" />
                <defs>
                  <path id="stampPathSearch" d="M60 60 m-45 0 a45 45 0 1 1 90 0 a45 45 0 1 1 -90 0" />
                </defs>
                <text className="mh-stamp-text">
                  <textPath href="#stampPathSearch">AYOOB BAKERY · THE WHOLE BOARD · ONE STONE OVEN · EST 1996 ·</textPath>
                </text>
                <g stroke="#26180E" strokeWidth="2.4" strokeLinecap="round" fill="none">
                  <path d="M60 46v30" />
                  <path d="M60 53l-8-8M60 53l8-8M60 63l-8-8M60 63l8-8M60 46q1-7 7-9" />
                </g>
              </svg>
            </span>
          </div>

          {/* the big search bar */}
          <form className="bigsearch" role="search" onSubmit={submit}>
            <span className="bs-ico" aria-hidden="true"><Search /></span>
            <label htmlFor="q" className="sr-only">Search the board</label>
            <input
              ref={inputRef}
              id="q"
              type="text"
              autoComplete="off"
              placeholder="sourdough, baklava, naan…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onInputKey}
            />
            {q && (
              <button
                type="button"
                className="bs-clear"
                onClick={() => { setQ(""); inputRef.current?.focus(); }}
                aria-label="Clear the search"
              >
                <X />
              </button>
            )}
            <button className="btn btn-primary btn-sm" type="submit">
              <span className="bs-lbl">Show me</span> <ArrowDown />
            </button>
          </form>

          <p className="bs-hint">
            Press <kbd>/</kbd> to search · <kbd>Esc</kbd> to clear
          </p>

          {/* recent + popular chips */}
          <div className="schips-row">
            {recents.length > 0 && (
              <div className="chip-group" aria-label="Your recent searches">
                <span className="chip-k">recent</span>
                {recents.map((r) => (
                  <span className="schip2" key={r}>
                    <button type="button" className="sc-go" onClick={() => useChip(r)}>
                      {r}
                    </button>
                    <button
                      type="button"
                      className="sc-x"
                      aria-label={`Remove ${r} from recent searches`}
                      onClick={() =>
                        setRecents((prev) => {
                          const next = prev.filter((x) => x !== r);
                          try {
                            localStorage.setItem("ayoob-recents", JSON.stringify(next));
                          } catch {}
                          return next;
                        })
                      }
                    >
                      <X />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {popularChips.length > 0 && (
              <div className="chip-group" aria-label="Popular searches">
                <span className="chip-k">popular</span>
                {popularChips.map((c) => (
                  <button key={c} type="button" className="schip2" onClick={() => useChip(c)}>
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ THE RESULTS ============ */}
      <section id="results" className="results-sec" ref={resultsRef}>
        <div className="wrap">
          {poolEmpty ? (
            /* the whole board is empty */
            <div className="search-empty">
              <span className="ring"><Wheat /></span>
              <b>The board is still being stocked</b>
              <p>
                The ovens are warming up and the bakes are on their way — check back after
                the morning bake.
              </p>
              <Link className="btn btn-ghost btn-sm" href="/">Back to the homepage</Link>
            </div>
          ) : hasQuery ? (
            results.length ? (
              <>
                <p className="rescount" aria-live="polite">
                  <b>{results.length}</b>{" "}
                  {results.length === 1 ? "bake" : "bakes"} match{" "}
                  &ldquo;{q.trim()}&rdquo;
                </p>

                {/* key replays the entrance stagger for every new query */}
                <div className="cards-grid" key={q.trim()}>
                  {results.map((p, i) => (
                    <ProductCard key={p._id} product={p as any} index={i} />
                  ))}
                </div>

                <p className="board-note" data-reveal>
                  Prices in AUD · everything wrapped in paper, never plastic · sold-out
                  lines reset at 6:30 am.
                </p>
              </>
            ) : (
              /* nothing found */
              <div className="search-empty" data-reveal>
                <span className="ring"><Wheat /></span>
                <b>Nothing in the oven with that name</b>
                <p>
                  Loosen the spelling or try a shorter word — or take one of these for a
                  spin, they always turn up:
                </p>
                {popularChips.length > 0 && (
                  <div className="empty-chips">
                    {popularChips.slice(0, 5).map((c) => (
                      <button key={c} type="button" className="schip2" onClick={() => useChip(c)}>
                        {c}
                      </button>
                    ))}
                  </div>
                )}
                <div className="empty-btns">
                  <a className="btn btn-primary btn-sm" href="tel:+61393872196">
                    <Phone /> Ring the counter
                  </a>
                  <button
                    className="btn btn-ghost btn-sm"
                    type="button"
                    onClick={() => { setQ(""); inputRef.current?.focus(); }}
                  >
                    Clear the search
                  </button>
                </div>
                <p className="empty-ps">
                  If we can bake it, we will — the counter loves a challenge.
                </p>
              </div>
            )
          ) : (
            /* no query yet — the popular shelf */
            <>
              <header className="sec-head">
                <div>
                  <p className="kicker" data-reveal>
                    <span className="k-no">01</span>
                    <span className="k-rule" />
                    <span>While you decide</span>
                  </p>
                  <h2 data-reveal style={d(".08s")}>
                    Popular <em>right now.</em>
                  </h2>
                </div>
                <p className="sec-note" data-reveal style={d(".16s")}>
                  The ones Brunswick keeps coming back for — or start typing and the board
                  bends to your craving.
                </p>
              </header>

              <div className="cards-grid">
                {popularPicks.map((p, i) => (
                  <ProductCard key={p._id} product={p as any} index={i} />
                ))}
              </div>

              <p className="board-note" data-reveal>
                Prices in AUD · everything wrapped in paper, never plastic · sold-out
                lines reset at 6:30 am.
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}