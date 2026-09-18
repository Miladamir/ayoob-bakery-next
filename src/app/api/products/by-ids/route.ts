import Category from "@/models/Category";
import Product from "@/models/Product";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

/* Phase 3: hard cap — matches the WishlistContext's local cap */
const MAX_IDS = 500;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const ids = searchParams.get("ids");

        if (!ids) {
            return NextResponse.json([]);
        }

        await dbConnect();

        const rawIds = ids.split(",").slice(0, MAX_IDS);
        const idArray: mongoose.Types.ObjectId[] = [];

        for (const id of rawIds) {
            const trimmed = id.trim();
            if (trimmed && /^[a-fA-F0-9]{24}$/.test(trimmed)) {
                try {
                    idArray.push(new mongoose.Types.ObjectId(trimmed));
                } catch (e) {
                    // Skip invalid
                }
            }
        }

        if (idArray.length === 0) {
            return NextResponse.json([]);
        }

        // Importing Category above registers its schema — that alone
        // prevents "MissingSchemaError" on cold starts.
        const products = await Product.find({ _id: { $in: idArray } })
            .select('name price images unit category badge discount')
            .populate('category', 'name')
            .lean();

        // PAYLOAD DIET (Phase 3): cards render one image
        const trimmed = products.map((p: any) => ({
            ...p,
            images: p.images?.slice(0, 1) ?? [],
        }));

        return NextResponse.json(JSON.parse(JSON.stringify(trimmed)));

    } catch (error: any) {
        console.error("--- WISHLIST API ERROR ---", error);
        return NextResponse.json({
            error: error.message
        }, { status: 500 });
    }
}