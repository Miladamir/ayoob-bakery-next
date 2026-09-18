import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/dbConnect";
import Blog from "@/models/Blog";
import { requireAdmin } from "@/lib/admin";
import { sanitizeHTML } from "@/lib/sanitize";
import { blogCreateSchema, safeJson, zodErrorMessage } from "@/lib/validate";

export async function POST(request: Request) {
  /* Phase 2: unified on requireAdmin + whitelisted body */
  const { denied } = await requireAdmin();
  if (denied) return denied;

  /* blog bodies can be long — read with a bigger cap */
  const raw = await safeJson(request, 300_000);
  const parsed = blogCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });
  }

  try {
    await dbConnect();

    /* SECURITY: sanitize the HTML content before storing it (XSS) */
    const { content, ...rest } = parsed.data;
    const newBlog = await Blog.create({
      ...rest,
      content: sanitizeHTML(content),
    });

    revalidatePath("/blogs");
    revalidatePath(`/blog/${newBlog._id}`);

    return NextResponse.json({ success: true, id: newBlog._id });
  } catch (error) {
    console.error("Create blog error:", error);
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}