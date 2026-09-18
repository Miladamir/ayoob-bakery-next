"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * PHASE 10 — pauses decorative animations in sections marked
 * [data-autopause] while they are outside the viewport (with a
 * 120px buffer so nothing pauses while still partially visible).
 *
 * Why: spinning stamps, flames, embers and the animated map keep
 * rasterizing every frame whether anyone can see them or not. When
 * off-screen, that work is pure waste — and on the main thread it
 * competes with Lenis's per-frame scroll.
 *
 * RULE for tagging sections (see site-effects.css): only sections
 * whose animations are all infinite/decorative. Never pause a
 * section containing entrance animations (pcIn / acIn / rowIn…)
 * or their playback timing changes.
 */
export default function AnimationGovernor() {
  const pathname = usePathname();

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-autopause]")
    );
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          en.target.classList.toggle("is-offscreen", !en.isIntersecting);
        });
      },
      { rootMargin: "120px 0px" }
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}