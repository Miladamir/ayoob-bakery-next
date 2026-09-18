/**
 * Flies a little product thumbnail from the clicked button to the
 * cart icon in the header, then bumps the cart badge.
 * Respects prefers-reduced-motion and no-ops when the cart icon
 * isn't on screen (e.g. admin pages).
 */
export function flyToCart(srcEl: HTMLElement | null | undefined, imgSrc?: string): void {
  if (!srcEl || !imgSrc) return;
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const target = document.getElementById("icoCart");
  if (!target || !target.offsetWidth) return;

  const s = srcEl.getBoundingClientRect();
  const t = target.getBoundingClientRect();

  const el = document.createElement("div");
  el.className = "fly";
  const img = document.createElement("img");
  img.src = imgSrc;
  img.alt = "";
  el.appendChild(img);
  el.style.left = `${s.left + s.width / 2 - 23}px`;
  el.style.top = `${s.top + s.height / 2 - 23}px`;
  document.body.appendChild(el);

  const dx = t.left + t.width / 2 - (s.left + s.width / 2);
  const dy = t.top + t.height / 2 - (s.top + s.height / 2);

  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      el.style.transform = `translate(${dx}px, ${dy}px) scale(.35) rotate(14deg)`;
      el.style.opacity = ".15";
    })
  );

  window.setTimeout(() => {
    el.remove();
    const badge = target.querySelector(".nav-badge");
    if (badge) {
      badge.classList.remove("bump");
      void (badge as HTMLElement).offsetWidth;
      badge.classList.add("bump");
    }
  }, 760);
}