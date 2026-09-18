"use client";

import { useEffect, useRef, useState } from "react";
import { Wheat } from "lucide-react";

/**
 * Flour-counter preloader. Adds `body.loaded` (which lifts the
 * curtain via pure CSS and triggers the hero fade-ins).
 * - Reduced motion: skips instantly.
 * - Seen once per browser session: skips the counter, quick lift.
 * - A 3.5s safety net in the root layout boot script guarantees the
 *   page always reveals, even if this component never hydrates.
 *
 * PHASE 10: no more React state per frame. The fill bar animates via
 * a compositor-only scaleX transform and the number updates a single
 * text node — zero re-renders during the busiest second of page load.
 */
export default function Preloader() {
  const [gone, setGone] = useState(false);
  const doneRef = useRef(false);
  const fillRef = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem("ayoob-seen") === "1";
    } catch {}

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      document.body.classList.add("loaded");
      try {
        sessionStorage.setItem("ayoob-seen", "1");
      } catch {}
      window.setTimeout(() => setGone(true), 1000);
    };

    const safety = window.setTimeout(finish, 3500);

    if (RM || alreadySeen) {
      if (fillRef.current) fillRef.current.style.transform = "none";
      if (numRef.current) numRef.current.textContent = "100";
      finish();
      return () => window.clearTimeout(safety);
    }

    const D = 1150;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / D);
      const e = 1 - Math.pow(1 - k, 3);
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${e.toFixed(4)})`;
      if (numRef.current) numRef.current.textContent = String(Math.round(e * 100));
      if (k < 1) raf = requestAnimationFrame(step);
      else window.setTimeout(finish, 160);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(safety);
    };
  }, []);

  if (gone) return null;

  return (
    <div id="preloader" aria-hidden="true">
      <div className="pl-inner">
        <span className="pl-mark">
          <Wheat />
        </span>
        <span className="pl-word">Ayoob Bakery</span>
        <div className="pl-row">
          <span className="pl-bar">
            <span className="pl-fill" ref={fillRef} />
          </span>
          <span className="pl-count" ref={numRef}>0</span>
        </div>
      </div>
    </div>
  );
}