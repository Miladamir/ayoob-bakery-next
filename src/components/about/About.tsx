"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Flame,
  Package,
  Store,
  Timer,
} from "lucide-react";
import { getStatus } from "@/lib/hours";

interface AboutProps {
  yearsBaking: number;
}

function SparkSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/* live open/closed pill — computed after mount (no hydration mismatch) */
function StatusPill() {
  const [status, setStatus] = useState<{ open: boolean; text: string } | null>(null);
  useEffect(() => {
    const upd = () => setStatus(getStatus());
    upd();
    const t = window.setInterval(upd, 30000);
    return () => window.clearInterval(t);
  }, []);
  if (!status) return null;
  return (
    <div className={`status-pill${status.open ? "" : " closed"}`}>
      <span className="pulse" />
      <span className="st-text">{status.text}</span>
    </div>
  );
}


export default function About({ yearsBaking }: AboutProps) {
  const heroRef = useRef<HTMLElement>(null);

  /* hero art parallax (fine pointers, motion-safe) */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const layers = Array.from(hero.querySelectorAll<HTMLElement>("[data-depth]"))
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
    hero.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      hero.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* animated hero stat counters — count up on scroll into view */
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".num");
    const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (RM) {
      els.forEach((el) => {
        el.textContent = (+(el.dataset.count || "0")).toLocaleString("en-AU") + (el.dataset.suffix || "");
      });
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          io.unobserve(en.target);
          const el = en.target as HTMLElement;
          const target = parseInt(el.dataset.count || "0", 10);
          const suf = el.dataset.suffix || "";
          const t0 = performance.now();
          const D = 1500;
          const step = (t: number) => {
            const k = Math.min(1, (t - t0) / D);
            const e = 1 - Math.pow(1 - k, 3);
            el.textContent = Math.round(target * e).toLocaleString("en-AU") + suf;
            if (k < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.6 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* tandoor CTA — adds the REAL featured bake */

  const d = (s: string) => ({ "--d": s } as React.CSSProperties);

  return (
    <>
      {/* ============ BEAT 1 · THE SHOPFRONT ============ */}
            {/* PHASE 10 data-autopause: stamp spin + window steam pause offscreen */}
      <section id="hero" className="shop-hero" ref={heroRef} data-autopause>
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight className="lucide" />
            <span aria-current="page">Our story</span>
          </nav>

          <div className="sh-grid">
            <div>
              <p className="kicker" data-reveal>
                <span className="k-rule" />
                <span>Our story · est. 1952</span>
              </p>
              <h1 className="sh-title" data-reveal style={d(".08s")}>
                Seventy years of <em>flour</em> on our hands.
              </h1>
              <p className="sh-sub" data-reveal style={d(".16s")}>
                A tiny shop at 4 Stevenson Avenue, one secondhand stone oven, and a recipe
                book carried from Kabul. Seventy years on, the oven hasn&rsquo;t stopped — and
                every loaf still goes out the door the morning it was baked.
              </p>
              <div className="sh-meta" data-reveal style={d(".24s")}>
                <div className="sh-stat">
                  <b className="num" data-count={yearsBaking}>0</b>
                  <span>years of baking</span>
                </div>
                <div className="sh-stat">
                  <b className="num" data-count="1">0</b>
                  <span>oven — never replaced</span>
                </div>
                <div className="sh-stat">
                  <b className="num" data-count="36" data-suffix="h">0</b>
                  <span>sourdough ferment</span>
                </div>
                <div className="sh-stat">
                  <b className="num" data-count="9400">0</b>
                  <span>loaves a month, by hand</span>
                </div>
                <StatusPill />
              </div>
            </div>

            <div className="sh-art" data-reveal style={d(".2s")}>
              <div className="art-l front-frame" data-depth="10">
                <svg viewBox="0 0 520 400" role="img" aria-label="Illustration of the Ayoob Bakery shopfront on Lygon Street">
                  <path d="M16 362 H504" stroke="#26180E" strokeWidth="4" strokeLinecap="round" />
                  <path d="M40 374 H150 M330 376 H470" stroke="#26180E" strokeWidth="3" strokeLinecap="round" opacity=".3" strokeDasharray="2 10" />
                  <rect x="70" y="66" width="340" height="296" rx="6" fill="#FFFDF6" stroke="#26180E" strokeWidth="4" />
                  <rect x="58" y="46" width="364" height="26" rx="8" fill="#26180E" />
                  <text x="240" y="64" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontWeight="700" fontSize="14" letterSpacing="5" fill="#FFFDF6">AYOOB BAKERY</text>
                  <rect x="84" y="88" width="312" height="10" rx="4" fill="#26180E" />
                  {/* awning */}
                  <path d="M84 98 L128 98 L128 134 A22 16 0 0 1 84 134 Z" fill="#C4551E" stroke="#26180E" strokeWidth="2.5" />
                  <path d="M128 98 L172 98 L172 134 A22 16 0 0 1 128 134 Z" fill="#EFE6D2" stroke="#26180E" strokeWidth="2.5" />
                  <path d="M172 98 L216 98 L216 134 A22 16 0 0 1 172 134 Z" fill="#C4551E" stroke="#26180E" strokeWidth="2.5" />
                  <path d="M216 98 L260 98 L260 134 A22 16 0 0 1 216 134 Z" fill="#EFE6D2" stroke="#26180E" strokeWidth="2.5" />
                  <path d="M260 98 L304 98 L304 134 A22 16 0 0 1 260 134 Z" fill="#C4551E" stroke="#26180E" strokeWidth="2.5" />
                  <path d="M304 98 L348 98 L348 134 A22 16 0 0 1 304 134 Z" fill="#EFE6D2" stroke="#26180E" strokeWidth="2.5" />
                  <path d="M348 98 L392 98 L392 134 A22 16 0 0 1 348 134 Z" fill="#C4551E" stroke="#26180E" strokeWidth="2.5" />
                  {/* window */}
                  <rect x="96" y="168" width="190" height="130" rx="4" fill="#EFE6D2" stroke="#26180E" strokeWidth="3" />
                  <path d="M191 168 V298" stroke="#26180E" strokeWidth="2.5" />
                  <path d="M108 288 L148 182" stroke="#FFFDF6" strokeWidth="5" opacity=".5" strokeLinecap="round" />
                  <path d="M124 290 L160 196" stroke="#FFFDF6" strokeWidth="4" opacity=".3" strokeLinecap="round" />
                  <path d="M102 250 H280" stroke="#26180E" strokeWidth="3" />
                  <g transform="translate(104 207) scale(.34)"><use href="#i-croissant" /></g>
                  <g transform="translate(148 209) scale(.34)"><use href="#i-donut" /></g>
                  <g transform="translate(198 214) scale(.32)"><use href="#i-boule" /></g>
                  <g transform="translate(246 209) scale(.3)"><use href="#i-scroll" /></g>
                  <rect x="110" y="262" width="26" height="14" rx="3" fill="#FFFDF6" stroke="#26180E" strokeWidth="2" />
                  <path d="M115 269 h16" stroke="#26180E" strokeWidth="2" strokeLinecap="round" />
                  <rect x="160" y="262" width="26" height="14" rx="3" fill="#FFFDF6" stroke="#26180E" strokeWidth="2" />
                  <path d="M165 269 h16" stroke="#26180E" strokeWidth="2" strokeLinecap="round" />
                  <g className="win-steam" fill="none" stroke="#26180E" strokeWidth="2.5" strokeLinecap="round" opacity=".35">
                    <path className="w1" d="M140 176 c-3-6 3-9 0-14" />
                    <path className="w2" d="M170 178 c-3-6 3-9 0-14" />
                    <path className="w3" d="M250 176 c-3-6 3-9 0-14" />
                  </g>
                  {/* door */}
                  <rect x="306" y="158" width="88" height="204" rx="3" fill="#C97E3F" stroke="#26180E" strokeWidth="3.5" />
                  <rect x="316" y="170" width="68" height="66" rx="3" fill="#EFE6D2" stroke="#26180E" strokeWidth="2.5" />
                  <path d="M316 203 h68" stroke="#26180E" strokeWidth="2" />
                  <circle cx="384" cy="252" r="4.5" fill="#26180E" />
                  <rect x="330" y="134" width="40" height="17" rx="3" fill="#FFFDF6" stroke="#26180E" strokeWidth="2" />
                  <text x="350" y="147" textAnchor="middle" fontFamily="Instrument Sans, sans-serif" fontWeight="700" fontSize="10" fill="#26180E">312</text>
                  {/* planter + lamp post + bike */}
                  <path d="M74 362 L78 340 H100 L104 362 Z" fill="#C4551E" stroke="#26180E" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M84 340 c-3-12 3-18 1-26 M92 340 c3-12 -3-18 -1-26 M88 340 v-30" fill="none" stroke="#26180E" strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
                  <path d="M414 362 v-24 M470 362 v-24 M406 338 H478" stroke="#26180E" strokeWidth="4" strokeLinecap="round" />
                  <g transform="translate(424 296) scale(.38)"><use href="#i-boule" /></g>
                  <circle cx="450" cy="338" r="19" fill="none" stroke="#26180E" strokeWidth="3.5" />
                  <circle cx="497" cy="338" r="19" fill="none" stroke="#26180E" strokeWidth="3.5" />
                  <path d="M450 324 v28 M436 338 h28 M497 324 v28 M483 338 h28" stroke="#26180E" strokeWidth="2" opacity=".55" />
                  <path d="M450 338 L470 302 L497 338 M470 302 l12 -6 M460 298 l10 4" fill="none" stroke="#26180E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="447" y="282" width="26" height="17" rx="2" fill="#EFE6D2" stroke="#26180E" strokeWidth="2.5" />
                  <g transform="translate(452 252) scale(.26) rotate(80)"><use href="#i-baguette" /></g>
                  <g stroke="#E7A23B" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M54 120 v12 M48 126 h12" />
                    <path d="M470 88 v10 M465 93 h10" />
                  </g>
                </svg>
                <p className="frame-cap">
                  4 Stevenson Avenue — <b>the window&rsquo;s been fogged since 1952.</b>
                </p>
              </div>

              <div className="art-l sh-stamp" data-depth="28" aria-hidden="true">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="56" fill="#FFFDF6" stroke="#26180E" strokeWidth="2.5" />
                  <circle cx="60" cy="60" r="33" fill="none" stroke="#26180E" strokeWidth="1.5" strokeDasharray="2 6" opacity=".5" />
                  <defs>
                    <path id="stampPathAbout" d="M60 60 m-45 0 a45 45 0 1 1 90 0 a45 45 0 1 1 -90 0" />
                  </defs>
                  <text className="stamp-text">
                    <textPath href="#stampPathAbout">AYOOB BAKERY · DANDENONG NORTH · MELBOURNE · EST 1952 ·</textPath>
                  </text>
                  <g stroke="#26180E" strokeWidth="2.4" strokeLinecap="round" fill="none">
                    <path d="M60 46v30" />
                    <path d="M60 53l-8-8M60 53l8-8M60 63l-8-8M60 63l8-8M60 46q1-7 7-9" />
                  </g>
                </svg>
              </div>

              <div className="art-l sh-chip" data-depth="36">
                <span className="chip-in"><Store /> the queue moves fast here</span>
              </div>

              <div className="art-l sh-spark" data-depth="22" aria-hidden="true">
                <SparkSvg />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BEAT 2 · THE STORY IN ONE BREATH ============ */}
      <section id="story" className="sec" data-autopause>
        <div className="wrap">
          <div className="story-grid">
            <div data-reveal>
              <div className="oven-frame">
                <svg className="oven-svg" viewBox="0 0 260 240" role="img" aria-label="Illustration of the 1996 stone deck oven">
                  <g className="steam" fill="none" stroke="#26180E" strokeWidth="3" strokeLinecap="round" opacity=".45">
                    <path className="s1" d="M96 34c-6-8 4-13 0-22" />
                    <path className="s2" d="M128 30c-6-8 4-13 0-22" />
                    <path className="s3" d="M160 34c-6-8 4-13 0-22" />
                  </g>
                  <rect x="30" y="44" width="200" height="146" rx="16" fill="#FFFDF6" stroke="#26180E" strokeWidth="4" />
                  <path d="M30 82h200" stroke="#26180E" strokeWidth="4" />
                  <g stroke="#26180E" strokeWidth="3" fill="#FFFDF6">
                    <circle cx="52" cy="63" r="8" /><circle cx="80" cy="63" r="8" /><circle cx="108" cy="63" r="8" />
                  </g>
                  <g stroke="#26180E" strokeWidth="2.5" fill="none" strokeLinecap="round">
                    <path d="M52 63l3-4M80 63l-3-4M108 63l4 3" />
                  </g>
                  <circle className="on-light" cx="220" cy="63" r="6" fill="#C4551E" />
                  <path d="M88 190v-44a42 42 0 0 1 84 0v44" fill="#33200F" stroke="#26180E" strokeWidth="4" />
                  <ellipse cx="130" cy="172" rx="26" ry="9" fill="#E7A23B" opacity=".9" />
                  <path className="fl fl1" d="M116 178c-3-10 5-15 3-25 9 6 12 15 9 25z" fill="#C4551E" />
                  <path className="fl fl2" d="M133 180c-2-8 4-12 2-19 7 5 8 12 5 19z" fill="#E7A23B" />
                  <path d="M104 190h52" stroke="#26180E" strokeWidth="4" strokeLinecap="round" />
                  <path d="M48 190v16M212 190v16" stroke="#26180E" strokeWidth="6" strokeLinecap="round" />
                </svg>
                <p className="oven-cap">
                  The deck oven — bought secondhand from a closing pizzeria in <b>1952</b>, still
                  perfect at 280&deg;.
                </p>
              </div>
            </div>

            <div className="story-copy" data-reveal style={d(".1s")}>
              <p className="kicker">
                <span className="k-no">01</span>
                <span className="k-rule" />
                <span>The beginning</span>
              </p>
              <h2>
                A shop, an oven, <em>and a stubborn idea.</em>
              </h2>
              <p>
                We first opened the doors in 1952 with one stone deck oven and a recipe book
                carried from Kabul. Melbourne already had bread, we were told — politely,
                repeatedly. It didn&rsquo;t have naan blistered on a tandoor wall or sourdough
                that slept for thirty-six hours. So we made those. Now newly reopened at
                4 Stevenson Avenue, the oven hasn&rsquo;t stopped, the recipe book has a rubber
                band around it, and the third generation kneads before school.
              </p>
            </div>
          </div>

          <blockquote className="bigquote" data-reveal>
            <p>If it&rsquo;s not good enough for our own table, it doesn&rsquo;t go on yours.</p>
            <cite>— the house rule, since day one</cite>
          </blockquote>

          <div className="rulechips" data-reveal style={d(".08s")}>
            <span className="rchip"><Flame /> Never day-old</span>
            <span className="rchip"><Timer /> Time, spent freely</span>
            <span className="rchip"><Package /> Paper &amp; string, never plastic</span>
          </div>
        </div>
      </section>
    </>
  );
}