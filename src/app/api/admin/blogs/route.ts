import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Blog from "@/models/Blog";
import { sanitizeHTML } from "@/lib/sanitize"; // Import sanitizer
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const body = await request.json();

    // SECURITY: Sanitize HTML content to prevent XSS
    if (body.content) {
        body.content = sanitizeHTML(body.content);
    }

    const newBlog = await Blog.create(body);

    revalidatePath('/blogs');

    return NextResponse.json({ success: true, id: newBlog._id });
}