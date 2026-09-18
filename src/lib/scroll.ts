import type Lenis from "lenis";

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis(): Lenis | null {
  return lenis;
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0);
  else window.scrollTo({ top: 0, behavior: "smooth" });
}

export function scrollToEl(target: HTMLElement, offset = -70) {
  if (lenis) lenis.scrollTo(target, { offset });
  else target.scrollIntoView({ behavior: "smooth" });
}