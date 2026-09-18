/* ============================================================
   SITE_URL — the ONE source of truth for every public-facing URL
   (canonical, OG, sitemap, robots, JSON-LD).

   Priority:
   1. NEXT_PUBLIC_SITE_URL — set this in production, e.g.
      https://ayoobbakery.com.au
   2. NEXTAUTH_URL — legacy fallback (works today, but it is an
      AUTH setting: if you ever point it at a different callback
      host, every SEO URL would silently change).
   3. localhost for local dev.

   We deliberately do NOT auto-detect Vercel's VERCEL_URL — that's
   the deployment URL (*.vercel.app), not your real domain; using it
   would emit deploy-URL canonicals that poison SEO.
============================================================ */
const raw =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  "http://localhost:3000";

/** trailing slashes stripped so canonicals can never double-slash */
export const SITE_URL = raw.replace(/\/+$/, "");