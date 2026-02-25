import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const body = await request.json();
    const newCat = await Category.create(body);

    revalidatePath('/');
    revalidatePath('/categories');

    return NextResponse.json({ success: true, id: newCat._id });
}