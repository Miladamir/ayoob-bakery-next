import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/dbConnect";
import Banner from "@/models/Banner";
import { requireAdmin } from "@/lib/admin";
import { isValidId } from "@/lib/validate";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!isValidId(id)) {
    return NextResponse.json({ error: "Invalid banner id" }, { status: 400 });
  }

  try {
    await dbConnect();
    await Banner.findByIdAndDelete(id);

    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete banner error:", error);
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}