import dbConnect from "@/lib/dbConnect";
import Banner from "@/models/Banner";
import { NextResponse } from "next/server";

// Fix: params is now a Promise
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params; // Await params

    try {
        await dbConnect();
        const banner = await Banner.findById(id);
        if (!banner) {
            return NextResponse.json({ error: "Banner not found" }, { status: 404 });
        }
        return NextResponse.json(banner);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch banner" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params; // Await params

    try {
        await dbConnect();
        const body = await request.json();
        const banner = await Banner.findByIdAndUpdate(id, body, { new: true });
        if (!banner) {
            return NextResponse.json({ error: "Banner not found" }, { status: 404 });
        }
        return NextResponse.json(banner);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params; // Await params

    try {
        await dbConnect();
        const banner = await Banner.findByIdAndDelete(id);
        if (!banner) {
            return NextResponse.json({ error: "Banner not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
    }
}