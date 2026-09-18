import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { isValidId, reviewCreateSchema, safeJson, zodErrorMessage } from "@/lib/validate";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rateLimit";

export async function POST(request: Request) {
  /* RATE LIMIT (Phase 2): 5 reviews per IP per 10 minutes */
  const rl = rateLimit(`review:${getClientIp(request)}`, 5, 10 * 60 * 1000);
  if (!rl.ok) return tooManyRequests(rl.retryAfterMs);

  const raw = await safeJson(request);
  const parsed = reviewCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });
  }
  const { productId, rating, comment, reviewerName } = parsed.data;

  const session = await getServerSession(authOptions);

  /* guests must leave a name — signed-in users always post under
     their own account name (reviewerName is ignored) */
  if (!session && !reviewerName) {
    return NextResponse.json({ error: "Please add your name" }, { status: 400 });
  }

  try {
    await dbConnect();

    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const uid = session?.user?.id;
    const userId = uid && isValidId(uid) ? new mongoose.Types.ObjectId(uid) : null;

    const displayName = session?.user?.name?.trim() || reviewerName || "Anonymous";

    /* PHASE 6 — duplicate guard: the same author posting the exact same
       words on the same product is a double-submit or a refresh-replay,
       not a new review. Different wording always passes — volume is
       already covered by the rate limit. */
    const authorKey = userId ? `u:${userId.toString()}` : `g:${displayName.toLowerCase()}`;
    const duplicate = (product.reviews as any[]).some((r) => {
      const rKey = r.userId ? `u:${r.userId.toString()}` : `g:${String(r.user || "").toLowerCase()}`;
      return rKey === authorKey && String(r.comment || "").trim() === comment;
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "You've already posted that review — word for word." },
        { status: 409 }
      );
    }

    const newReview = {
      userId,
      user: displayName,
      rating,
      comment,
      date: new Date(),
    };

    product.reviews.push(newReview);

    /* recalculate the average from the (now validated) list */
    const totalRating = product.reviews.reduce(
      (acc: number, item: any) => item.rating + acc,
      0
    );
    product.ratings = totalRating / product.reviews.length;

    await product.save();

    /* PHASE 4: bust the cached product page */
    revalidatePath(`/product/${productId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Review post error:", error);
    return NextResponse.json({ error: "Failed to post review" }, { status: 500 });
  }
}