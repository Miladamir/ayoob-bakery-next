import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const ids = searchParams.get("ids");

        if (!ids) {
            return NextResponse.json([]);
        }

        // Connect to DB
        await dbConnect();

        // Sanitize IDs
        const rawIds = ids.split(",");
        const idArray: mongoose.Types.ObjectId[] = [];

        for (const id of rawIds) {
            const trimmed = id.trim();
            if (trimmed && /^[a-fA-F0-9]{24}$/.test(trimmed)) {
                try {
                    idArray.push(new mongoose.Types.ObjectId(trimmed));
                } catch (e) {
                    // Skip invalid ObjectIds
                }
            }
        }

        if (idArray.length === 0) {
            return NextResponse.json([]);
        }

        // Fetch Products
        const products = await Product.find({ _id: { $in: idArray } })
            .select('name price images unit category badge discount')
            .populate('category', 'name')
            .lean();

        return NextResponse.json(JSON.parse(JSON.stringify(products)));

    } catch (error: any) {
        // PROFESSIONAL DEBUG: Log to Vercel logs and return details to frontend
        console.error("Wishlist API Error:", error);

        return NextResponse.json({
            error: error.message || "Unknown Server Error",
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}