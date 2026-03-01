import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Blog from "@/models/Blog";
import { sanitizeHTML } from "@/lib/sanitize"; // Import sanitizer
import { revalidatePath } from "next/cache";

// FIX: Changed params type to Promise for Next.js 15+
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    // FIX: Await params
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const body = await request.json();

    // SECURITY: Sanitize HTML content to prevent XSS
    if (body.content) {
        body.content = sanitizeHTML(body.content);
    }

    await Blog.findByIdAndUpdate(id, body);

    revalidatePath('/blogs');
    return NextResponse.json({ success: true });
}

// FIX: Changed params type to Promise for Next.js 15+
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    // FIX: Await params
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    await Blog.findByIdAndDelete(id);

    revalidatePath('/blogs');
    return NextResponse.json({ success: true });
}