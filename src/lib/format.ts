/** "$9.50" — matches the template's money() helper */
export function money(n: number): string {
  return "$" + n.toFixed(2);
}

/** Strip HTML tags + collapse whitespace (for plain-text excerpts) */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>?/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* PHASE 9 (B6): via.placeholder.com shut down — its URLs now hang or
   404, so the "no image" fallback itself was broken. This inline SVG
   data URI renders instantly, costs zero requests, and matches the
   site palette. Safe in RSC and client components alike. */
export function placeholderImg(w: number, h: number, label = "Ayoob Bakery"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="#EFE6D2"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.round(Math.min(w, h) / 8)}" fill="#6B5946">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** URL-safe slug from arbitrary text (blog tags etc.) */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}