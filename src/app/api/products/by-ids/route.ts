import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import mongoose from "mongoose";

// CRITICAL FIX: Force Vercel to never cache this API response
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids");

    // 1. Early return for empty state
    if (!ids) {
        return NextResponse.json([]);
    }

    try {
        await dbConnect();

        // 2. Robust Sanitization
        const rawIds = ids.split(",");
        const idArray: mongoose.Types.ObjectId[] = [];

        for (const id of rawIds) {
            const trimmed = id.trim();
            // Strict validation: must be 24-char hex string
            if (trimmed && /^[a-fA-F0-9]{24}$/.test(trimmed)) {
                try {
                    idArray.push(new mongoose.Types.ObjectId(trimmed));
                } catch (e) {
                    // Ignore invalid object IDs
                }
            }
        }

        if (idArray.length === 0) return NextResponse.json([]);

        // 3. Fetch Products
        const products = await Product.find({ _id: { $in: idArray } })
            .select('name price images unit category badge discount')
            .populate('category', 'name')
            .lean();

        // 4. Return with Cache-Control headers (Double protection)
        return NextResponse.json(JSON.parse(JSON.stringify(products)), {
            headers: {
                'Cache-Control': 'no-store, must-revalidate'
            }
        });

    } catch (error) {
        console.error("Fetch by IDs error:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}