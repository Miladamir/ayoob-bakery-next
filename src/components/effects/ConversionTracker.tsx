"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

/**
 * SEO-2 — conversion events for the actions a bakery actually cares
 * about: calling the counter, opening directions, starting an email.
 * Event delegation: ONE document listener that fires only on click —
 * zero cost on the scroll path (Phase 10 discipline maintained).
 * No-ops locally and on non-Vercel hosts; appears under
 * Vercel → Analytics → Events once enabled.
 */
export default function ConversionTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (href.startsWith("tel:")) track("call_tap");
      else if (href.startsWith("mailto:")) track("email_tap");
      else if (href.includes("maps.google.com") || href.includes("google.com/maps"))
        track("directions_tap");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}