"use client";

import { useEffect } from "react";

/**
 * Global reveal-on-scroll for [data-reveal] elements — hydration-safe.
 *
 * PHASE 10 rewrite: the old MutationObserver handler ran a
 * document-wide querySelectorAll + Object.keys() on EVERY class
 * change anywhere in the body (toasts, FAQ toggles, hearts, even
 * the reveal animations themselves) — constant main-thread churn
 * during exactly the moments Lenis needs the thread. Now:
 *  - class mutations → one hasAttribute() check, O(1)
 *  - React className rewrites that wipe `revealed` (FAQ toggles)
 *    are re-applied directly, O(1)
 *  - new nodes → scanned in their own subtree only
 *
 * Hydration safety (unchanged concept): only observe nodes React
 * owns (has a __reactFiber$/__reactProps$ marker) so streamed HTML
 * is never mutated before hydration diffs it; un-owned nodes queue
 * and poll until hydration lands. 4s failsafe still guarantees
 * nothing can stay hidden.
 */
export default function RevealObserver() {
  useEffect(() => {
    const docEl = document.documentElement;
    docEl.classList.add("js");
    (window as unknown as { __ayoobReveal?: boolean }).__ayoobReveal = true;

    const pending = new Set<Element>();          // streamed in, not yet hydrated
    const revealedEver = new WeakSet<Element>(); // revealed at least once

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("revealed");
            revealedEver.add(en.target);
            pending.delete(en.target);
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7%" }
    );

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
      if (el.classList.contains("revealed")) {
        revealedEver.add(el);
        return;
      }
      if (isReactOwned(el)) io.observe(el);
      else pending.add(el);
    };

    /* scan only within a given root (document, or one added subtree) */
    const scanRoot = (root: ParentNode) => {
      root.querySelectorAll("[data-reveal]:not(.revealed)").forEach((el) => {
        if (pending.has(el) || revealedEver.has(el)) return;
        tryObserve(el);
      });
    };

    scanRoot(document);

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList") {
          m.addedNodes.forEach((n) => {
            if (n.nodeType !== 1) return;
            const el = n as Element;
            if (el.matches?.("[data-reveal]:not(.revealed)")) tryObserve(el);
            scanRoot(el);
          });
        } else if (m.type === "attributes") {
          /* className rewrite on a data-reveal element (FAQ toggles):
             if it had been revealed and React wiped the class,
             re-apply it instantly — one check, no document scan */
          const t = m.target as Element;
          if (
            t.hasAttribute?.("data-reveal") &&
            !t.classList.contains("revealed")
          ) {
            if (revealedEver.has(t)) {
              t.classList.add("revealed");
            } else if (!pending.has(t)) {
              tryObserve(t);
            }
          }
        }
      }
    });
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
      scanRoot(document);
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