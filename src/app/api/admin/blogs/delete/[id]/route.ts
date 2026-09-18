import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/dbConnect";
import Blog from "@/models/Blog";
import { requireAdmin } from "@/lib/admin";
import { isValidId } from "@/lib/validate";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!isValidId(id)) {
    return NextResponse.json({ error: "Invalid blog id" }, { status: 400 });
  }

  try {
    await dbConnect();
    await Blog.findByIdAndDelete(id);

    /* PHASE 4: revalidate the list AND the deleted post's cached page */
    revalidatePath("/blogs");
    revalidatePath(`/blog/${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete blog error:", error);
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}