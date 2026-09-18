import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "./auth";

/* ============================================================
   ADMIN GUARD — every admin mutation route starts with this.
   Fixes #1/#2: update + GET routes were wide open.
============================================================ */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session?.user as any)?.role !== "admin") {
    return {
      session: null,
      denied: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, denied: null };
}

/* ---------- helpers ---------- */

export const isValidId = (v: unknown): v is string =>
  typeof v === "string" && mongoose.isValidObjectId(v);

const toStr = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

const toNum = (v: unknown): number | null => {
  const n =
    typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? parseFloat(v) : NaN;
  return Number.isFinite(n) ? n : null;
};

const toStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : [];

export const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ============================================================
   PRODUCT SANITIZER — fixes #7.
   Whitelists fields, coerces types, clamps values, and strips
   everything system-managed (ratings, salesCount, reviews,
   _id, timestamps) so it can never be injected from a request.
   mode "create": required fields enforced.
   mode "update": only provided keys pass through (so clearing
   a field in the form actually clears it).
============================================================ */
export function sanitizeProduct(
  body: Record<string, unknown>,
  mode: "create" | "update"
): { data: Record<string, unknown> | null; error?: string } {
  const out: Record<string, unknown> = {};
  const has = (k: string) => mode === "create" || k in body;

  if (has("name")) {
    const name = toStr(body.name);
    if (!name) return { data: null, error: "Product name is required." };
    out.name = name;
  }

  if (has("price")) {
    const price = toNum(body.price);
    if (price === null || price < 0)
      return { data: null, error: "Price must be a valid, non-negative number." };
    out.price = Math.round(price * 100) / 100;
  }

  if (has("discount")) {
    const raw = body.discount;
    const d =
      raw === "" || raw === null || raw === undefined ? 0 : toNum(raw);
    if (d === null || d < 0 || d > 100)
      return { data: null, error: "Discount must be between 0 and 100." };
    out.discount = d;
  }

  if (has("category")) {
    const cat = toStr(body.category);
    if (!isValidId(cat))
      return { data: null, error: "A valid category is required." };
    out.category = cat;
  }

  if (has("unit")) {
    const u = toStr(body.unit);
    out.unit = u === "kg" || u === "lb" ? u : "quantity";
  }

  if (has("badge")) out.badge = toStr(body.badge);

  if (has("images")) {
    const imgs = toStringArray(body.images);
    if (mode === "create" && imgs.length === 0)
      return { data: null, error: "At least one image URL is required." };
    out.images = imgs;
  }

  for (const k of ["description", "shortDescription", "ingredients", "nutrition"] as const) {
    if (k in body) out[k] = toStr(body[k]);
  }

  if (has("features")) out.features = toStringArray(body.features);

  if (has("options")) {
    const raw = Array.isArray(body.options) ? body.options : [];
    out.options = raw
      .map((g: any) => ({
        name: toStr(g?.name),
        values: Array.isArray(g?.values)
          ? g.values
              .map((v: any) => ({
                value: toStr(v?.value),
                price: Math.max(0, toNum(v?.price) ?? 0),
              }))
              .filter((v: any) => v.value !== "")
          : [],
      }))
      .filter((g: any) => g.name && g.values.length > 0);
  }

  return { data: out };
}

/* ============================================================
   CATEGORY SANITIZER — fixes #3/#4 at the source:
   parent "" | null | undefined → null (top-level).
============================================================ */
export function sanitizeCategory(
  body: Record<string, unknown>,
  mode: "create" | "update"
): { data: Record<string, unknown> | null; error?: string } {
  const out: Record<string, unknown> = {};
  const has = (k: string) => mode === "create" || k in body;

  if (has("name")) {
    const name = toStr(body.name);
    if (!name) return { data: null, error: "Category name is required." };
    if (name.length > 60)
      return { data: null, error: "Category name is too long (60 characters max)." };
    out.name = name;
  }

  if (has("parent")) {
    const p = body.parent;
    if (p === "" || p === null || p === undefined) {
      out.parent = null;
    } else if (isValidId(p as string)) {
      out.parent = p as string;
    } else {
      return { data: null, error: "Parent category is invalid." };
    }
  }

  if ("image" in body) out.image = toStr(body.image);
  if ("description" in body) out.description = toStr(body.description);

  return { data: out };
}