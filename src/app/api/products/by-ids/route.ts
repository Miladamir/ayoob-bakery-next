import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import mongoose from "mongoose";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids");

    if (!ids) {
        return NextResponse.json([]);
    }

    try {
        await dbConnect();

        // FIX: Strictly sanitize and validate IDs
        const rawIds = ids.split(",");
        const idArray: mongoose.Types.ObjectId[] = [];

        for (const id of rawIds) {
            const trimmed = id.trim(); // Remove accidental spaces
            // Validate it's a 24-char hex string (MongoDB ObjectId)
            if (trimmed && /^[a-fA-F0-9]{24}$/.test(trimmed)) {
                try {
                    idArray.push(new mongoose.Types.ObjectId(trimmed));
                } catch (e) {
                    console.warn(`Invalid ObjectId skipped: ${trimmed}`);
                }
            }
        }

        if (idArray.length === 0) return NextResponse.json([]);

        const products = await Product.find({ _id: { $in: idArray } })
            .select('name price images unit category badge discount')
            .populate('category', 'name')
            .lean();

        return NextResponse.json(JSON.parse(JSON.stringify(products)));

    } catch (error) {
        console.error("Fetch by IDs error:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}