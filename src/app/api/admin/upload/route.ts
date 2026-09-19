import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/admin";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rateLimit";

/* ============================================================
   ADMIN IMAGE UPLOAD — device file → Cloudinary → secure URL.

   - Signed, server-side upload (the API secret never ships to
     the browser; unsigned uploads are deliberately NOT used).
   - Admin session required; 60 uploads/IP/hour.
   - JPG / PNG / WebP / AVIF / GIF, max 8 MB.
   - folder is whitelisted → uploads land in ayoob/products,
     ayoob/blogs, ayoob/banners or ayoob/categories, nowhere else.
============================================================ */

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

const FOLDERS = new Set(["products", "blogs", "banners", "categories"]);

const MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

export async function POST(request: Request) {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  const rl = rateLimit(`upload:${getClientIp(request)}`, 60, 60 * 60 * 1000);
  if (!rl.ok) return tooManyRequests(rl.retryAfterMs);

  /* cheap early bail on oversized bodies */
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_BYTES * 1.1) {
    return NextResponse.json({ error: "Images max out at 8 MB." }, { status: 413 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const folder = String(form?.get("folder") || "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }
  if (!FOLDERS.has(folder)) {
    return NextResponse.json({ error: "Unknown upload destination." }, { status: 400 });
  }
  if (!MIMES.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported type — use JPG, PNG, WebP, AVIF or GIF." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Images max out at 8 MB." }, { status: 413 });
  }

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return NextResponse.json(
      { error: "Image uploads aren't configured — set the CLOUDINARY_* env vars." },
      { status: 500 }
    );
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `ayoob/${folder}`,
      resource_type: "image",
    });

    return NextResponse.json({ success: true, url: result.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ error: "Upload failed — please try again." }, { status: 500 });
  }
}