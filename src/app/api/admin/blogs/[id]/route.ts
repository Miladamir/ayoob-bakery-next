import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/dbConnect";
import Blog from "@/models/Blog";
import { requireAdmin } from "@/lib/admin";
import { sanitizeHTML } from "@/lib/sanitize";
import {
  blogUpdateSchema,
  isValidId,
  safeJson,
  stripUndefined,
  zodErrorMessage,
} from "@/lib/validate";

async function updateBlog(request: Request, id: string) {
  if (!isValidId(id)) {
    return NextResponse.json({ error: "Invalid blog id" }, { status: 400 });
  }

  const raw = await safeJson(request, 300_000);
  const parsed = blogUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });
  }

  try {
    await dbConnect();

    const { content, ...rest } = parsed.data;

    /* only the fields the request actually sent; content sanitized */
    const update: Record<string, unknown> = stripUndefined(rest) as any;
    if (content !== undefined) update.content = sanitizeHTML(content);

    const blog = await Blog.findByIdAndUpdate(id, update, { new: true });
    if (!blog) return NextResponse.json({ error: "Blog post not found" }, { status: 404 });

    /* PHASE 4: post pages are cached — revalidate this one */
    revalidatePath("/blogs");
    revalidatePath(`/blog/${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update blog error:", error);
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { denied } = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  return updateBlog(request, id);
}

/* the handler the form actually calls */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { denied } = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  return updateBlog(request, id);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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