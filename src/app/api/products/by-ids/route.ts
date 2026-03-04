// 1. CRITICAL: Import models used in .populate() to register their schemas
import Category from "@/models/Category";
import Product from "@/models/Product";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // 2. Force reference the model to ensure schema is registered in this isolated serverless function
        // This prevents "MissingSchemaError" on cold starts
        if (!mongoose.models.Category) {
            mongoose.model('Category', Category.schema);
        }

        const { searchParams } = new URL(request.url);
        const ids = searchParams.get("ids");

        if (!ids) {
            return NextResponse.json([]);
        }

        await dbConnect();

        const rawIds = ids.split(",");
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

        // 3. Perform the query
        const products = await Product.find({ _id: { $in: idArray } })
            .select('name price images unit category badge discount')
            .populate('category', 'name')
            .lean();

        return NextResponse.json(JSON.parse(JSON.stringify(products)));

    } catch (error: any) {
        console.error("--- WISHLIST API ERROR ---", error);
        return NextResponse.json({
            error: error.message
        }, { status: 500 });
    }
}