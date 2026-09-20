"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Flame, Wheat } from "lucide-react";

interface Particle {
  x: number; y: number; r: number; spd: number;
  sw: number; sspd: number; vx: number; vy: number;
  a: number; c: string; life?: number;
}

const LETTERS = ["A", "Y", "O", "O", "B"];

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const cv = canvasRef.current;
    if (!hero || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const FINE = window.matchMedia("(pointer: fine)").matches;

    let fmx = -9999, fmy = -9999;
    let heroNX = 0, heroNY = 0;
    let heroInView = true;
    let cw = 0, ch = 0;
    let ps: Particle[] = [];
    let raf = 0;

    /* ---------- flour canvas ---------- */
    const sizeFlour = () => {
      const r = hero.getBoundingClientRect();
      const dpr = Math.min(1.25, window.devicePixelRatio || 1);
      cv.width = r.width * dpr;
      cv.height = r.height * dpr;
      cw = r.width;
      ch = r.height;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seedFlour = () => {
      ps = [];
      const n = Math.min(110, Math.round((cw || 900) / 10));
      for (let i = 0; i < n; i++) {
        const roll = Math.random();
        ps.push({
          x: Math.random() * (cw || 900),
          y: Math.random() * (ch || 600),
          r: 0.8 + Math.random() * 2.3,
          spd: 0.12 + Math.random() * 0.3,
          sw: Math.random() * 6.28,
          sspd: 0.006 + Math.random() * 0.012,
          vx: 0, vy: 0,
          a: 0.07 + Math.random() * 0.18,
          c: roll > 0.85 ? "#C4551E" : roll > 0.72 ? "#E7A23B" : "#26180E",
        });
      }
    };

    const drawFlour = () => {
      if (RM || !heroInView || document.hidden) return;
      ctx.clearRect(0, 0, cw, ch);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        if (p.life !== undefined) {
          p.life -= 0.02;
          if (p.life <= 0) { ps.splice(i, 1); continue; }
          p.a = p.life * 0.35;
        }
        const dx = p.x - fmx, dy = p.y - fmy, d2 = dx * dx + dy * dy;
        if (fmx > -9000 && d2 < 16900) {
          const d = Math.sqrt(d2) || 1, f = (1 - d / 130) * 2.2;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        p.sw += p.sspd;
        p.x += p.vx + Math.sin(p.sw) * 0.35;
        p.y += p.vy + p.spd;
        p.vx *= 0.9;
        p.vy *= 0.9;
        if (p.y > ch + 12) { p.y = -10; p.x = Math.random() * cw; }
        if (p.x > cw + 12) p.x = -10;
        if (p.x < -12) p.x = cw + 10;
        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    /* ---------- pointer: repulsion source + parallax axes ---------- */
    const onPointer = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      fmx = e.clientX - r.left;
      fmy = e.clientY - r.top;
      heroNX = (e.clientX / window.innerWidth - 0.5) * 2;
      heroNY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    /* click anywhere in the hero (not on a control) = flour burst */
    const onClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (t?.closest?.("a,button") || RM) return;
      const r = hero.getBoundingClientRect();
      const bx = e.clientX - r.left, by = e.clientY - r.top;
      for (let i = 0; i < 24; i++) {
        const a = Math.random() * 6.28, s = 1.5 + Math.random() * 3;
        ps.push({
          x: bx, y: by, r: 1 + Math.random() * 2, spd: 0, sw: 0, sspd: 0,
          vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1,
          a: 0.35, c: Math.random() > 0.7 ? "#C4551E" : "#26180E", life: 1,
        });
      }
    };

    /* ---------- parallax layers ---------- */
    const layerEls = Array.from(
      hero.querySelectorAll<HTMLElement>(".hero-art [data-depth]")
    );
    const layers = layerEls.map((el) => ({
      el, d: parseFloat(el.dataset.depth || "0"), x: 0, y: 0,
    }));

    const tick = () => {
      if (FINE) {
        for (const l of layers) {
          l.x += (heroNX * l.d - l.x) * 0.07;
          l.y += (heroNY * l.d - l.y) * 0.07;
          l.el.style.transform = `translate(${l.x.toFixed(1)}px,${l.y.toFixed(1)}px)`;
        }
      }
      drawFlour();
      raf = requestAnimationFrame(tick);
    };

    sizeFlour();
    seedFlour();

    const onResize = () => { sizeFlour(); seedFlour(); };

    /* PHASE 5: stop the frame loop ENTIRELY while the hero is
       off-screen — no parallax lerp, no canvas work, no frame callbacks
       while the visitor reads the rest of the (long) homepage. It
       resumes the instant the hero scrolls back into view, with the
       layers lerping to their current targets exactly as they always
       did after any pause. */
    const io = new IntersectionObserver(
      (en) => {
        heroInView = en[0].isIntersecting;
        if (heroInView) {
          if (!raf) raf = requestAnimationFrame(tick);
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 }
    );

    window.addEventListener("resize", onResize);
    io.observe(hero);
    hero.addEventListener("pointermove", onPointer);
    hero.addEventListener("click", onClick);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      hero.removeEventListener("pointermove", onPointer);
      hero.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <section id="hero-home" ref={heroRef} data-autopause>
      <canvas id="flour" ref={canvasRef} aria-hidden="true" />

      <div className="hero-main wrap">
        <div className="hero-copy">
          <p className="hero-eyebrow hero-fade" style={{ "--d": ".4s" } as React.CSSProperties}>
            <Wheat />
            <span>Artisan bakery — Dandenong North, Melbourne</span>
          </p>

          <h1 className="hero-title" aria-label="Ayoob Bakery">
            {LETTERS.map((l, i) => (
              <span
                className="hl"
                style={{ "--i": i } as React.CSSProperties}
                aria-hidden="true"
                key={i}
              >
                <i>{l}</i>
              </span>
            ))}
          </h1>

          <div className="hero-bakery hero-fade" style={{ "--d": ".95s" } as React.CSSProperties}>
            <em>Bakery</em>
            <svg className="swash" viewBox="0 0 220 26" aria-hidden="true">
              <path
                d="M4 18 C60 8 150 6 216 12"
                stroke="#C4551E"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                pathLength={1}
              />
            </svg>
            <span className="hero-est">est. 1996</span>
          </div>

          <p className="hero-fade" style={{ "--d": "1.1s" } as React.CSSProperties}>
            We bring together traditional recipes, multicultural flavours, and the art of handmade baking. From familiar classics to inspired creations from around the world, every product is made with care, quality ingredients, and respect for the traditions behind it.
          </p>

          <div className="hero-ctas hero-fade" style={{ "--d": "1.25s" } as React.CSSProperties}>
            <Link href="/products" className="btn btn-primary">
              Browse all products <ArrowRight />
            </Link>
          </div>
        </div>

        {/* hero art — decorative */}
        <div
          className="hero-art hero-fade"
          style={{ "--d": "1.15s" } as React.CSSProperties}
          aria-hidden="true"
        >
          <div className="art-l art-cr-wrap" data-depth="16">
            <div className="art-cr">
              <svg viewBox="0 0 120 120">
                <g stroke="#26180E" strokeWidth="3" fill="#E7A23B">
                  <ellipse cx="27" cy="79" rx="9" ry="13" transform="rotate(-64 27 79)" />
                  <ellipse cx="93" cy="79" rx="9" ry="13" transform="rotate(64 93 79)" />
                  <ellipse cx="37" cy="66" rx="14" ry="20" transform="rotate(-38 37 66)" />
                  <ellipse cx="83" cy="66" rx="14" ry="20" transform="rotate(38 83 66)" />
                  <ellipse cx="60" cy="58" rx="19" ry="27" />
                </g>
                <path
                  d="M50 40 q8 -6 18 -2"
                  fill="none" stroke="#FFFDF6" strokeWidth="3"
                  strokeLinecap="round" opacity=".8"
                />
                <circle cx="22" cy="100" r="2.2" fill="#26180E" />
                <circle cx="98" cy="102" r="2.6" fill="#26180E" />
                <circle cx="86" cy="106" r="1.8" fill="#26180E" />
              </svg>
            </div>
          </div>

          <div className="art-l art-stamp-wrap" data-depth="30">
            <svg className="stamp-svg" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="56" fill="#FFFDF6" stroke="#26180E" strokeWidth="2.5" />
              <circle cx="60" cy="60" r="33" fill="none" stroke="#26180E" strokeWidth="1.5" strokeDasharray="2 6" opacity=".5" />
              <defs>
                <path id="stampPath" d="M60 60 m-45 0 a45 45 0 1 1 90 0 a45 45 0 1 1 -90 0" />
              </defs>
              <text className="stamp-text">
                <textPath href="#stampPath">
                  AYOOB BAKERY · DANDENONG NORTH · MELBOURNE · EST 1952 ·
                </textPath>
              </text>
              <g stroke="#26180E" strokeWidth="2.4" strokeLinecap="round" fill="none">
                <path d="M60 46v30" />
                <path d="M60 53l-8-8M60 53l8-8M60 63l-8-8M60 63l8-8M60 46q1-7 7-9" />
              </g>
            </svg>
          </div>

          <div className="art-l art-chip" data-depth="38">
            <span className="chip-in">
              <Flame />
              out of the oven at 8:00 am
            </span>
          </div>

          <div className="art-l art-spark" data-depth="24">
            <svg viewBox="0 0 24 24">
              <path
                d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"
                fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="hero-foot wrap hero-fade" style={{ "--d": "1.45s" } as React.CSSProperties}>
        <div className="scroll-cue">
          <span className="cue-line" />
          <span>scroll — it smells good down here</span>
        </div>
      </div>
    </section>
  );
}