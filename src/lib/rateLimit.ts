import { NextResponse } from "next/server";

/* ============================================================
   RATE LIMITER — in-memory sliding window.

   Limits are per server instance (fine for a bakery site — burst
   abuse and brute force are blocked wherever they land). If you
   ever need global limits across serverless instances, the
   drop-in upgrade is Upstash Redis; the call sites below won't
   change.

   Local dev note: with no proxy in front, every request shares
   the "unknown" IP bucket — restart the dev server to reset.
============================================================ */

/** the longest window any caller may use — bounds memory */
const MAX_WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface Bucket {
  hits: number[]; // timestamps inside the window
  windowMs: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  /** ms until the oldest hit expires — 0 when ok */
  retryAfterMs: number;
}

/** Count one attempt against `key`. Returns ok=false once `limit`
    attempts happened inside `windowMs`. */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const win = Math.min(windowMs, MAX_WINDOW_MS); // defensive clamp
  const now = Date.now();

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { hits: [], windowMs: win };
    buckets.set(key, bucket);
    /* opportunistic sweep — no timers, serverless-safe */
    if (buckets.size > 5_000) sweep(now);
  }

  /* drop expired hits */
  bucket.hits = bucket.hits.filter((t) => now - t < bucket.windowMs);

  if (bucket.hits.length >= limit) {
    const retryAfterMs = Math.max(1_000, win - (now - bucket.hits[0]));
    return { ok: false, retryAfterMs };
  }

  bucket.hits.push(now);
  return { ok: true, retryAfterMs: 0 };
}

/** Clear a key — e.g. a successful login resets its failure count. */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    bucket.hits = bucket.hits.filter((t) => now - t < bucket.windowMs);
    if (bucket.hits.length === 0) buckets.delete(key);
  }
}

/* ---------- request helpers ---------- */

/** Client IP from the platform's forwarded headers (Vercel sets
    x-forwarded-for to the real client chain). Falls back to
    "unknown" — in dev that's every local request in one bucket. */
export function getClientIp(request: Request): string {
  try {
    const fwd = request.headers.get("x-forwarded-for");
    if (fwd) {
      const first = fwd.split(",")[0].trim();
      if (first) return first;
    }
    return request.headers.get("x-real-ip")?.trim() || "unknown";
  } catch {
    return "unknown";
  }
}

/** A ready-to-return 429 — body carries both `error` and `message`
    so every existing client (they read different keys) shows the text. */
export function tooManyRequests(retryAfterMs: number): NextResponse {
  const seconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
  const msg = "That's a few too quickly — take a breath and try again shortly.";
  const res = NextResponse.json({ error: msg, message: msg }, { status: 429 });
  res.headers.set("Retry-After", String(seconds));
  return res;
}