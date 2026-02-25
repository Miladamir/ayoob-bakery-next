import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Blog from "@/models/Blog";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const body = await request.json();
    const newBlog = await Blog.create(body);

    revalidatePath('/blogs');

    return NextResponse.json({ success: true, id: newBlog._id });
}