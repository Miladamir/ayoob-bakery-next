/** @type {import('next').NextConfig} */

/* SECURITY HEADERS (Phase 2) — applied to every route.

   Deliberately NOT added:
   - Content-Security-Policy: this site needs inline scripts (the
     preloader boot script), inline styles (CSS-variable styling
     everywhere) and DB-driven image URLs from arbitrary hosts
     (admins paste any image URL) — a CSP would have to be so
     permissive it adds no real protection. Revisit if that ever
     changes.
   - HSTS "preload": only after a deliberate decision to enroll the
     domain in the HSTS preload list (hard to reverse). */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig = {
  // Keep this for Mongoose compatibility on Serverless
  serverExternalPackages: ["mongoose", "bcryptjs", "cloudinary"],

  // Don't advertise the framework (removes the X-Powered-By header)
  poweredByHeader: false,

  images: {
    /* PHASE 5: AVIF first (30–50% smaller than WebP at equal quality),
       WebP fallback, original as last resort — chosen per browser via
       the Accept header, automatically, for every next/image. */
    formats: ["image/avif", "image/webp"],

    /* PHASE 5: how long the image optimizer trusts a remote image
       before re-fetching it. Safe because the optimizer cache is keyed
       by the full source URL — "changing" an image always means
       changing its URL, which is a fresh cache entry. */
    minimumCacheTTL: 2678400, // 31 days

    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'randomuser.me' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'cdn-icons-png.flaticon.com' },
      { protocol: 'https', hostname: 'www.transparenttextures.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },

  /* PHASE 5: React Compiler — auto-memoizes your client components
     (ProductDetail, Shop, SearchClient, CartClient…) so re-renders
     do far less work. The babel-plugin-react-compiler already pinned
     in devDependencies satisfies the build either way.
     NOTE: if your exact Next version rejects this key, the build will
     say so — move it to `experimental: { reactCompiler: true }`. */
  reactCompiler: true,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;