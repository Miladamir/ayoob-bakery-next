import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/dbConnect";
import Banner from "@/models/Banner";
import { requireAdmin } from "@/lib/admin";
import { bannerCreateSchema, safeJson, zodErrorMessage } from "@/lib/validate";

/* Hardened (pulled forward from Phase 2): the auth check was inline;
   the create body went straight from the request into the database. */
export async function POST(request: Request) {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  const raw = await safeJson(request);
  const parsed = bannerCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });
  }

  try {
    await dbConnect();
    const newBanner = await Banner.create(parsed.data as any);

    revalidatePath("/");
    return NextResponse.json({ success: true, id: newBanner._id });
  } catch (error) {
    console.error("Create banner error:", error);
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}