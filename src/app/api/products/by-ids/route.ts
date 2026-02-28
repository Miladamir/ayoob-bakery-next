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

        // Convert strings to ObjectIDs safely
        const idArray = ids.split(",").map(id => {
            try {
                return new mongoose.Types.ObjectId(id);
            } catch {
                return null; // Handle invalid IDs
            }
        }).filter(id => id !== null);

        if (idArray.length === 0) return NextResponse.json([]);

        // Single query with $in
        const products = await Product.find({ _id: { $in: idArray } })
            .select('name price images unit category badge discount') // Only necessary fields
            .populate('category', 'name') // Populate only category name
            .lean();

        return NextResponse.json(JSON.parse(JSON.stringify(products)));

    } catch (error) {
        console.error("Fetch by IDs error:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}