"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { setLenis } from "@/lib/scroll";

/**
 * Lenis smooth scrolling — global for all public pages.
 * - Skipped entirely for prefers-reduced-motion.
 * - Watches body classes (`menu-open`, `locked`) so the mobile
 *   menu and the cart modal automatically pause the scroller.
 * - Smooth-scrolls in-page hash links (#main, etc.) with nav offset.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const docEl = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lenis: Lenis | null = null;
    let raf = 0;

    try {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      setLenis(lenis);
      docEl.classList.add("lenis");

      const loop = (time: number) => {
        lenis?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    } catch {
      lenis = null;
    }

    // stop/start when a menu or modal locks the page
    const body = document.body;
    const syncLock = () => {
      const locked =
        body.classList.contains("menu-open") || body.classList.contains("locked");
      if (locked) lenis?.stop();
      else lenis?.start();
    };
    const mo = new MutationObserver(syncLock);
    mo.observe(body, { attributes: true, attributeFilter: ["class"] });

    // smooth in-page anchors
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.(
        "a[href^='#']"
      ) as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.length < 2) return;
      const t = document.querySelector(href);
      if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t as HTMLElement, { offset: -70 });
      else (t as HTMLElement).scrollIntoView({ behavior: "smooth" });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      mo.disconnect();
      cancelAnimationFrame(raf);
      docEl.classList.remove("lenis");
      setLenis(null);
      lenis?.destroy();
    };
  }, []);

  return null;
}