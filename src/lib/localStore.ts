/* ============================================================
   GUEST STORAGE — versioned, crash-proof localStorage access
   for the cart + wishlist.

   Phase 6 contract: every read function NEVER throws and ALWAYS
   returns schema-valid data. Corrupt / foreign / absent data
   degrades to empty (and is repaired on the next write), so a
   broken localStorage can never wedge the providers again —
   previously a single bad byte left the cart skeleton spinning
   forever.

   Versioning: payloads are envelopes { v: N, ... }. Legacy v1
   (bare arrays, the pre-Phase-6 format) is still read and gets
   migrated to v2 on the next write. Unknown future versions
   start clean rather than guessing.
============================================================ */

const CART_KEY = "cart_guest";
const WISHLIST_KEY = "wishlist_guest";

const CART_VERSION = 2;
const WISHLIST_VERSION = 2;

const MAX_QTY = 99;

export interface GuestCartItem {
  _id: string;
  name: string;
  price: number;
  images: string[];
  unit: string;
  quantity: number;
  note?: string;
  variant?: string;
}

/* ---------- primitives ---------- */

export const isId = (v: unknown): v is string =>
  typeof v === "string" && /^[a-fA-F0-9]{24}$/.test(v);

function safeParse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* ---------- cart ---------- */

/** Validate + clamp one stored line; null → drop it entirely */
function validCartItem(v: unknown): GuestCartItem | null {
  if (typeof v !== "object" || v === null) return null;
  const it = v as Record<string, unknown>;

  if (!isId(it._id)) return null;
  if (typeof it.name !== "string" || !it.name.trim()) return null;

  const price = Number(it.price);
  if (!Number.isFinite(price) || price < 0) return null;

  const quantity = Math.round(Number(it.quantity));
  if (!Number.isFinite(quantity) || quantity < 1) return null;

  const images = Array.isArray(it.images)
    ? it.images.filter((x): x is string => typeof x === "string")
    : [];

  return {
    _id: it._id,
    name: it.name,
    price,
    images,
    unit: typeof it.unit === "string" ? it.unit : "quantity",
    quantity: Math.min(MAX_QTY, quantity),
    note: typeof it.note === "string" ? it.note : undefined,
    variant:
      typeof it.variant === "string" && it.variant.trim()
        ? it.variant.slice(0, 100)
        : undefined,
  };
}

/** If storage somehow holds duplicate (id, variant) lines, keep the max */
function dedupe(items: GuestCartItem[]): GuestCartItem[] {
  const map = new Map<string, GuestCartItem>();
  for (const it of items) {
    const key = it.variant ? `${it._id}@${it.variant}` : it._id;
    const prev = map.get(key);
    if (!prev || it.quantity > prev.quantity) map.set(key, it);
  }
  return [...map.values()];
}

export function readGuestCart(): GuestCartItem[] {
  try {
    const parsed = safeParse(localStorage.getItem(CART_KEY));
    if (parsed === null) return [];

    /* v2 envelope */
    if (
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      (parsed as Record<string, unknown>).v === CART_VERSION
    ) {
      const items = (parsed as Record<string, unknown>).items;
      if (!Array.isArray(items)) return [];
      return dedupe(items.map(validCartItem).filter(Boolean) as GuestCartItem[]);
    }

    /* legacy v1 — a bare array; migrated to v2 on the next write */
    if (Array.isArray(parsed)) {
      return dedupe(parsed.map(validCartItem).filter(Boolean) as GuestCartItem[]);
    }

    /* anything else — unknown shape or a future version → start clean */
    return [];
  } catch {
    return [];
  }
}

export function writeGuestCart(items: GuestCartItem[]): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify({ v: CART_VERSION, items }));
  } catch {
    /* storage full or blocked — the in-memory cart keeps working */
  }
}

export function clearGuestCart(): void {
  try {
    localStorage.removeItem(CART_KEY);
  } catch {}
}

/* ---------- wishlist ---------- */

export function readGuestWishlist(): string[] {
  try {
    const parsed = safeParse(localStorage.getItem(WISHLIST_KEY));
    let ids: unknown = null;

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed) &&
      (parsed as Record<string, unknown>).v === WISHLIST_VERSION
    ) {
      ids = (parsed as Record<string, unknown>).ids;
    } else if (Array.isArray(parsed)) {
      /* legacy v1 — a bare array of ids */
      ids = parsed;
    }

    if (!Array.isArray(ids)) return [];
    /* only valid, unique ids survive */
    return [...new Set(ids.filter(isId))];
  } catch {
    return [];
  }
}

export function writeGuestWishlist(ids: string[]): void {
  try {
    const clean = [...new Set(ids.filter(isId))];
    localStorage.setItem(WISHLIST_KEY, JSON.stringify({ v: WISHLIST_VERSION, ids: clean }));
  } catch {
    /* storage full or blocked — the in-memory wishlist keeps working */
  }
}

export function clearGuestWishlist(): void {
  try {
    localStorage.removeItem(WISHLIST_KEY);
  } catch {}
}