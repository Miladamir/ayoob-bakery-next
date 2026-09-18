import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/dbConnect";
import Banner from "@/models/Banner";
import { requireAdmin } from "@/lib/admin";
import {
  bannerUpdateSchema,
  isValidId,
  safeJson,
  stripUndefined,
  zodErrorMessage,
} from "@/lib/validate";

/* SECURITY FIX (S1): this route previously had NO auth check —
   anyone on the internet could read and rewrite banners.
   Both handlers now require an admin session, validate the id,
   and whitelist the update body. */

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!isValidId(id)) return NextResponse.json({ error: "Invalid banner id" }, { status: 400 });

  try {
    await dbConnect();
    const banner = await Banner.findById(id).lean();
    if (!banner) return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    return NextResponse.json(banner);
  } catch (error) {
    console.error("Fetch banner error:", error);
    return NextResponse.json({ error: "Failed to fetch banner" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!isValidId(id)) return NextResponse.json({ error: "Invalid banner id" }, { status: 400 });

  const raw = await safeJson(request);
  const parsed = bannerUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });
  }

  try {
    await dbConnect();
    /* only the whitelisted fields the request actually sent */
    const banner = await Banner.findByIdAndUpdate(
      id,
      stripUndefined(parsed.data) as any,
      { new: true }
    );
    if (!banner) return NextResponse.json({ error: "Banner not found" }, { status: 404 });

    revalidatePath("/");
    return NextResponse.json(banner);
  } catch (error) {
    console.error("Update banner error:", error);
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}