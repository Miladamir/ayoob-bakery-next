"use client";

import { useEffect } from "react";

/**
 * Global reveal-on-scroll for [data-reveal] elements — hydration-safe.
 *
 * On dynamic pages the server streams HTML into the DOM *before* React
 * hydrates it. Revealing a node in that window mutates server-rendered
 * attributes React hasn't compared yet → hydration mismatch.
 *
 * The rule: only reveal nodes React OWNS. React attaches its internal
 * `__reactFiber$` marker to a node after that node's attributes have
 * been diffed and accepted, so:
 *   • marker present → hydrated → safe to add `revealed`
 *   • marker absent  → still streamed HTML → queue + poll
 *
 * Hardening:
 *   • watches class mutations — if React rewrites an element's
 *     className (FAQ toggles) and wipes `revealed`, it re-reveals
 *   • 4s failsafe — nothing can ever stay hidden
 */
export default function RevealObserver() {
  useEffect(() => {
    const docEl = document.documentElement;
    docEl.classList.add("js");
    (window as unknown as { __ayoobReveal?: boolean }).__ayoobReveal = true;

    const pending = new Set<Element>(); // streamed in, not yet hydrated

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("revealed");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7%" }
    );

    /* React attaches __reactFiber$<hash> / __reactProps$<hash> to a
       node only once it has created or hydrated it. */
    const isReactOwned = (el: Element): boolean => {
      try {
        return Object.keys(el).some(
          (k) => k.startsWith("__reactFiber") || k.startsWith("__reactProps")
        );
      } catch {
        return true; // can't inspect → don't hold the element hostage
      }
    };

    const tryObserve = (el: Element) => {
      if (el.classList.contains("revealed")) return;
      if (isReactOwned(el)) io.observe(el); // observe() is idempotent
      else pending.add(el);
    };

    const scan = () => {
      document
        .querySelectorAll("[data-reveal]:not(.revealed)")
        .forEach(tryObserve);
    };

    scan();

    /* new nodes (client-side navigation) + className rewrites
       (React toggling `open` on FAQ items) both need a re-scan */
    const mo = new MutationObserver(scan);
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    /* queued streamed nodes: reveal them the moment hydration lands */
    const poll = window.setInterval(() => {
      if (!pending.size) return;
      for (const el of Array.from(pending)) {
        if (!el.isConnected) {
          pending.delete(el);
        } else if (isReactOwned(el)) {
          pending.delete(el);
          io.observe(el);
        }
      }
    }, 100);

    /* failsafe: never leave anything hidden, whatever happened */
    const failsafe = window.setTimeout(() => {
      for (const el of Array.from(pending)) {
        pending.delete(el);
        io.observe(el);
      }
      scan();
    }, 4000);

    return () => {
      mo.disconnect();
      io.disconnect();
      window.clearInterval(poll);
      window.clearTimeout(failsafe);
    };
  }, []);

  return null;
}