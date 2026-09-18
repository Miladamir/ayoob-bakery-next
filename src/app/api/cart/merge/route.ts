import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { cartMergeSchema, safeJson, zodErrorMessage } from "@/lib/validate";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await safeJson(request);
  const parsed = cartMergeSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });
  }
  const { items } = parsed.data;

  try {
    await dbConnect();

    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    items.forEach((newItem) => {
      const existing = user.cart.find(
        (c: any) =>
          c.productId.toString() === newItem._id &&
          (c.variant || null) === newItem.variant
      );
      if (existing) {
        /* PHASE 6 (B5): the merge takes the LARGER quantity, capped at 99.
           Previously the guest quantity silently OVERWROTE the server's —
           server had 3, guest had 1, and the line became 1. */
        existing.quantity = Math.min(99, Math.max(existing.quantity, newItem.quantity));
      } else {
        user.cart.push({
          productId: new mongoose.Types.ObjectId(newItem._id),
          quantity: newItem.quantity,
          variant: newItem.variant,
        });
      }
    });

    await user.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart Merge Error:", error);
    return NextResponse.json({ error: "Failed to merge cart" }, { status: 500 });
  }
}