import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

// PUT: Edit Review
export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId, reviewId, rating, comment } = await request.json();
    await dbConnect();

    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Fix: Cast to 'any' to access Mongoose subdocument methods like .id()
    const review = (product.reviews as any).id(reviewId);

    // Security check: ensure user owns this review
    if (!review || (review.userId && review.userId.toString() !== session.user.id)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    review.rating = parseInt(rating);
    review.comment = comment;
    review.date = new Date(); // Update date

    // Recalculate ratings
    const totalRating = product.reviews.reduce((acc: number, item: any) => item.rating + acc, 0);
    product.ratings = totalRating / product.reviews.length;

    await product.save();
    return NextResponse.json({ success: true });
}

// DELETE: Delete Review
export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Note: DELETE requests usually don't have a body in strict REST, 
    // but we keep it consistent with your frontend implementation.
    const { productId, reviewId } = await request.json();
    await dbConnect();

    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Fix: Cast to 'any' to access Mongoose subdocument methods like .id()
    const review = (product.reviews as any).id(reviewId);

    if (!review || (review.userId && review.userId.toString() !== session.user.id)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use deleteOne() on the subdocument
    review.deleteOne();

    // Recalculate ratings
    const totalRating = product.reviews.reduce((acc: number, item: any) => item.rating + acc, 0);
    product.ratings = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;

    await product.save();
    return NextResponse.json({ success: true });
}