import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import {
  reviewDeleteSchema,
  reviewEditSchema,
  safeJson,
  zodErrorMessage,
} from "@/lib/validate";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = await safeJson(request);
  const parsed = reviewEditSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });
  }
  const { productId, reviewId, rating, comment } = parsed.data;

  try {
    await dbConnect();

    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const review = (product.reviews as any).id(reviewId);

    const isAdmin = session.user.role === "admin";
    const ownsIt = !!review?.userId && review.userId.toString() === session.user.id;

    if (!review || !(ownsIt || isAdmin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    review.rating = rating;
    review.comment = comment;
    review.date = new Date();

    const totalRating = product.reviews.reduce(
      (acc: number, item: any) => item.rating + acc,
      0
    );
    product.ratings = totalRating / product.reviews.length;

    await product.save();

    /* PHASE 4 (B3): bust the cached product page */
    revalidatePath(`/product/${productId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Review edit error:", error);
    return NextResponse.json({ error: "Failed to edit review" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = await safeJson(request);
  const parsed = reviewDeleteSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });
  }
  const { productId, reviewId } = parsed.data;

  try {
    await dbConnect();

    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const review = (product.reviews as any).id(reviewId);

    const isAdmin = session.user.role === "admin";
    const ownsIt = !!review?.userId && review.userId.toString() === session.user.id;

    if (!review || !(ownsIt || isAdmin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    review.deleteOne();

    const totalRating = product.reviews.reduce(
      (acc: number, item: any) => item.rating + acc,
      0
    );
    product.ratings =
      product.reviews.length > 0 ? totalRating / product.reviews.length : 0;

    await product.save();

    /* PHASE 4 (B3): bust the cached product page */
    revalidatePath(`/product/${productId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Review delete error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}