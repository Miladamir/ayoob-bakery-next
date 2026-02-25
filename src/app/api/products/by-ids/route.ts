import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids");

    if (!ids) {
        return NextResponse.json([]);
    }

    try {
        await dbConnect();
        const idArray = ids.split(",");
        const products = await Product.find({ _id: { $in: idArray } }).populate('category').lean();
        return NextResponse.json(JSON.parse(JSON.stringify(products)));
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}