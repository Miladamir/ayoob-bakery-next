"use client";

import { useRef, useState } from "react";

/* ============================================================
   ADMIN IMAGE UPLOAD BUTTON — pick a file (or several), it goes
   to Cloudinary via /api/admin/upload, and the returned URL is
   handed to the form through onUploaded.

   Client-side checks mirror the server's (mime + 8MB) so the
   failure is instant and friendly; the server remains the real
   gate. Matches the admin panel's legacy Tailwind styling.
============================================================ */

const MAX_MB = 8;
const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

interface ImageUploadProps {
  folder: "products" | "blogs" | "banners" | "categories";
  multiple?: boolean;
  label?: string;
  onUploaded: (url: string) => void;
}

export default function ImageUpload({
  folder,
  multiple = false,
  label = "Upload image",
  onUploaded,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const uploadOne = async (file: File): Promise<string> => {
    if (!ACCEPT.includes(file.type)) {
      throw new Error("Unsupported type — use JPG, PNG, WebP, AVIF or GIF.");
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      throw new Error(`"${file.name}" is over ${MAX_MB} MB.`);
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || "Upload failed — try again.");
    return data.url as string;
  };

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // allow re-selecting the same file
    if (!files.length) return;

    setBusy(true);
    setErr("");
    try {
      for (const f of files) {
        /* sequential — appended URLs keep selection order */
        onUploaded(await uploadOne(f));
      }
    } catch (ex: any) {
      setErr(ex?.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-col items-start gap-1 flex-shrink-0">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(",")}
        multiple={multiple}
        onChange={onChange}
        className="hidden"
        disabled={busy}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="whitespace-nowrap bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-brand-700 transition-colors disabled:opacity-50"
      >
        {busy ? (
          <>
            <i className="fa-solid fa-spinner fa-spin mr-2"></i>Uploading…
          </>
        ) : (
          <>
            <i className="fa-solid fa-cloud-arrow-up mr-2"></i>{label}
          </>
        )}
      </button>
      {err && <span className="text-xs text-red-600 max-w-[220px] leading-snug">{err}</span>}
    </span>
  );
}