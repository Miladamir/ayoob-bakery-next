import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Banner from "@/models/Banner";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const body = await request.json();
    const newBanner = await Banner.create(body);

    revalidatePath('/');
    return NextResponse.json({ success: true, id: newBanner._id });
}