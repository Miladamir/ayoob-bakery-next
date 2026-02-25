import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
        return NextResponse.json([]);
    }

    try {
        await dbConnect();

        // Find products where name matches the query (case-insensitive)
        const products = await Product.find({
            name: { $regex: query, $options: "i" }
        })
            .select("name") // Only select the name field for performance
            .limit(10);

        // Return just an array of names
        const suggestions = products.map(p => p.name);

        return NextResponse.json(suggestions);
    } catch (error) {
        console.error("Search suggest error:", error);
        return NextResponse.json([], { status: 500 });
    }
}