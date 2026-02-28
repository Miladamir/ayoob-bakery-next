import dbConnect from "@/lib/dbConnect";
import Banner from "@/models/Banner";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await dbConnect();
        const banner = await Banner.findById(id);
        if (!banner) return NextResponse.json({ error: "Banner not found" }, { status: 404 });
        return NextResponse.json(banner);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch banner" }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await dbConnect();
        const body = await request.json();
        const banner = await Banner.findByIdAndUpdate(id, body, { new: true });
        if (!banner) return NextResponse.json({ error: "Banner not found" }, { status: 404 });

        revalidatePath('/');
        return NextResponse.json(banner);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
    }
}