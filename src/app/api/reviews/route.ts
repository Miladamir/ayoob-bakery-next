import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

// POST: Submit a new review
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    await dbConnect();

    const { productId, rating, comment, reviewerName } = await request.json();

    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const newReview = {
        userId: session ? session.user.id : null,
        user: session ? session.user.name : reviewerName,
        rating: parseInt(rating),
        comment,
        date: new Date()
    };

    product.reviews.push(newReview);

    // Recalculate average rating
    const totalRating = product.reviews.reduce((acc: number, item: any) => item.rating + acc, 0);
    product.ratings = totalRating / product.reviews.length;

    await product.save();

    return NextResponse.json({ success: true });
}