import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    // Hard limit for performance
    if (!query || query.length < 2) {
        return NextResponse.json([]);
    }

    try {
        await dbConnect();

        // Use a simple regex search on 'name' only (indexed field ideally)
        // Limit strictly to 5 results for speed
        const products = await Product.find({
            name: { $regex: query, $options: "i" }
        })
            .select("name -_id") // Only return name, exclude _id to save bytes
            .limit(5)
            .lean();

        // Return just an array of strings
        const suggestions = products.map(p => p.name);

        return NextResponse.json(suggestions);

    } catch (error) {
        console.error("Search suggest error:", error);
        // Return empty array on error so UI doesn't break
        return NextResponse.json([], { status: 500 });
    }
}