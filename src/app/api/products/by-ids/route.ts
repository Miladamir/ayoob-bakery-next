import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Category from "@/models/Category"; // CRITICAL FIX: Import Category to register schema
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const ids = searchParams.get("ids");

        if (!ids) {
            return NextResponse.json([]);
        }

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
        // Since we imported Category above, .populate will work correctly
        const products = await Product.find({ _id: { $in: idArray } })
            .select('name price images unit category badge discount')
            .populate('category', 'name')
            .lean();

        return NextResponse.json(JSON.parse(JSON.stringify(products)));

    } catch (error: any) {
        console.error("--- WISHLIST API ERROR ---");
        console.error(error);

        // Return the ACTUAL error message to help debug
        return NextResponse.json({
            error: error.message,
            name: error.name,
            // Send stack only if needed (remove in final production if desired)
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}