import { z } from "zod";

/* ============================================================
   SHARED INPUT VALIDATION — the single home for API body schemas.

   Rule introduced in Phase 1: no mutating route touches the
   database before its input passes a schema from this file.
   The bounds mirror the client-side rules, so real users never
   hit them — only tampered or corrupted requests do.
============================================================ */

/* ---------- primitives ---------- */

/** 24-char hex string — a MongoDB ObjectId */
export const objectId = z
  .string()
  .trim()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid id format");

/** quick non-zod check, for route params */
export const isValidId = (v: unknown): v is string =>
  typeof v === "string" && /^[a-fA-F0-9]{24}$/.test(v);

/** whole number 1–99; missing / null / "" → 1 (keeps the old `|| 1` behaviour) */
export const quantityWithDefault = z.preprocess(
  (v) => (v === null || v === undefined || v === "" ? 1 : v),
  z.coerce
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(99, "Quantity can't go above 99")
);

/** whole number 1–99 — must be present */
export const quantityRequired = z.coerce
  .number()
  .int("Quantity must be a whole number")
  .min(1, "Quantity must be at least 1")
  .max(99, "Quantity can't go above 99");

/** a product variant label, e.g. "Half boule" — optional, capped */
export const variant = z
  .string()
  .trim()
  .min(1, "Variant can't be empty")
  .max(100, "Variant label is too long")
  .optional()
  .nullable()
  .transform((v) => (v ? v : null));

/* ---------- request body helper ---------- */

/**
 * Safe JSON read — never throws and caps the body size.
 * Returns null for anything unreadable; the schema turns null
 * into a clean 400 instead of an unhandled 500.
 */
export async function safeJson(
  request: Request,
  maxChars = 100_000
): Promise<unknown> {
  try {
    const declared = Number(request.headers.get("content-length") || 0);
    if (declared > maxChars) return null;
    const text = await request.text();
    if (text.length > maxChars) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** the first useful message from a failed parse */
export function zodErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid request";
}

/** drop keys whose value is undefined — partial updates stay partial */
export function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

/* ---------- cart ---------- */

export const cartAddSchema = z.object({
  quantity: quantityWithDefault,
  variant,
});

export const cartUpdateSchema = z.object({
  quantity: quantityRequired,
  variant,
});

export const cartRemoveSchema = z.object({
  variant,
});

export const cartMergeSchema = z.object({
  items: z
    .array(
      z.object({
        _id: objectId,
        quantity: quantityRequired,
        variant,
      })
    )
    .max(100, "Too many cart lines"),
});

/* ---------- reviews ---------- */

const rating = z.coerce
  .number()
  .int("Rating must be a whole number")
  .min(1, "Rating must be between 1 and 5")
  .max(5, "Rating must be between 1 and 5");

const reviewComment = z
  .string()
  .trim()
  .min(10, "Reviews need at least 10 characters")
  .max(500, "Reviews max out at 500 characters");

export const reviewCreateSchema = z.object({
  productId: objectId,
  rating,
  comment: reviewComment,
  /** guests only — ignored for signed-in users */
  reviewerName: z
    .string()
    .trim()
    .min(2, "Name is too short")
    .max(60, "Name is too long")
    .optional(),
});

export const reviewEditSchema = z.object({
  productId: objectId,
  reviewId: objectId,
  rating,
  comment: reviewComment,
});

export const reviewDeleteSchema = z.object({
  productId: objectId,
  reviewId: objectId,
});

/* ---------- auth ---------- */

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tell us your name — at least 2 characters")
    .max(60, "Name is too long"),
  email: z
    .string()
    .trim()
    .email("That email doesn't look right")
    .max(254, "That email is too long")
    /* PHASE 8: emails are case-insensitive — normalize at the door */
    .transform((s) => s.toLowerCase()),
  /* bcrypt only reads the first 72 bytes of a password — cap here
     so hashing can never silently ignore part of it */
  password: z
    .string()
    .min(8, "Passwords need at least 8 characters")
    .max(72, "Passwords max out at 72 characters"),
});

/* ---------- public forms ---------- */

export const contactSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  email: z.string().trim().email("That email doesn't look right").max(254),
  /* newlines stripped: the subject goes into an email header */
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required")
    .max(120)
    .transform((s) => s.replace(/[\r\n]+/g, " ")),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

export const newsletterSchema = z.object({
  /* PHASE 8: lowercased so the subscribers collection can't collect
     Foo@x.com AND foo@x.com as two entries */
  email: z
    .string()
    .trim()
    .email("That email doesn't look right")
    .max(254)
    .transform((s) => s.toLowerCase()),
});

/* ---------- wishlist ---------- */

export const wishlistMergeSchema = z.object({
  ids: z.array(objectId).max(500, "Too many wishlist ids"),
});

/* ---------- admin: banners ---------- */

/* The current BannerForm sends `link` for the model's `buttonLink`
   field — accept both so the form keeps working until it's rebuilt. */
const normalizeBannerBody = (body: unknown) => {
  if (typeof body !== "object" || body === null) return body;
  const b = { ...(body as Record<string, unknown>) };
  if (b.link !== undefined && b.buttonLink === undefined) {
    b.buttonLink = b.link;
  }
  return b;
};

/* everything optional → partial updates only touch sent fields */
const bannerObject = z.object({
  title: z.string().trim().min(1, "Banner title is required").max(120).optional(),
  subtitle: z.string().trim().max(200).optional(),
  description: z.string().trim().max(1000).optional(),
  image: z.string().trim().min(1, "Banner image is required").max(500).optional(),
  buttonText: z.string().trim().max(60).optional(),
  buttonLink: z.string().trim().max(500).optional(),
  position: z.enum(["hero", "promo"]).optional(),
  /* absent → undefined (update leaves it alone);
     "" / null / unparseable → null (no expiry) */
  expiryDate: z
    .union([z.string(), z.number(), z.date()])
    .optional()
    .nullable()
    .transform((v) => {
      if (v === undefined) return undefined;
      if (v === null || v === "") return null;
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? null : d;
    }),
  isActive: z.boolean().optional(),
  order: z.coerce.number().int().min(0).max(9999).optional(),
});

export const bannerUpdateSchema = z.preprocess(normalizeBannerBody, bannerObject);

export const bannerCreateSchema = z.preprocess(
  normalizeBannerBody,
  bannerObject.extend({
    title: z.string().trim().min(1, "Banner title is required").max(120),
    image: z.string().trim().min(1, "Banner image is required").max(500),
  })
);

/* ============================================================
   ADMIN: BLOGS — added in Phase 2 (fixes B1)
   The form has always sent author + tags; the model now keeps them.
============================================================ */

/* absent stays absent (undefined) so partial updates don't clobber;
   null / "" become "" (the model treats empty as "no image") */
const blogImage = z
  .string()
  .trim()
  .max(500, "Image URL is too long")
  .optional()
  .nullable()
  .transform((v) => (v === undefined ? undefined : v || ""));

export const blogCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  /* deliberately NOT trimmed or transformed — the route sanitizes
     this HTML before it's stored */
  content: z.string().min(1, "Content is required").max(200_000, "Content is too long"),
  image: blogImage,
  author: z.string().trim().max(60, "Author name is too long").optional(),
  tags: z
    .array(z.string().trim().min(1).max(40, "Tags max out at 40 characters"))
    .max(12, "Too many tags")
    .optional(),
});

export const blogUpdateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long").optional(),
  content: z.string().min(1, "Content is required").max(200_000, "Content is too long").optional(),
  image: blogImage,
  author: z.string().trim().max(60, "Author name is too long").optional(),
  tags: z
    .array(z.string().trim().min(1).max(40, "Tags max out at 40 characters"))
    .max(12, "Too many tags")
    .optional(),
});

/* ---------- admin: newsletter send — added in Phase 2 ---------- */

export const newsletterSendSchema = z.object({
  /* newlines stripped: the subject goes into an email header */
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required")
    .max(150, "Subject is too long")
    .transform((s) => s.replace(/[\r\n]+/g, " ")),
  /* admin-authored HTML by design — not escaped, just capped */
  content: z.string().min(1, "Content is required").max(200_000, "Content is too long"),
});