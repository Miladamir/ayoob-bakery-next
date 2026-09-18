import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import mongoose from "mongoose";
import { cartAddSchema, isValidId, safeJson, zodErrorMessage } from "@/lib/validate";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  /* SECURITY FIX (S3): quantity was unvalidated — negative numbers,
     floats, huge values and string quantities (which concat instead
     of add) all reached the database. */
  if (!isValidId(id)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const raw = await safeJson(request);
  const parsed = cartAddSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });
  }
  const { quantity, variant } = parsed.data;

  await dbConnect();

  if (session?.user?.id) {
    try {
      const user = await User.findById(session.user.id);
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      /* a line is (product, variant) — different variants are different lines */
      const existingItem = user.cart.find(
        (item: any) =>
          item.productId.toString() === id && (item.variant || null) === variant
      );

      if (existingItem) {
        existingItem.quantity = Math.min(99, existingItem.quantity + quantity);
      } else {
        user.cart.push({
          productId: new mongoose.Types.ObjectId(id),
          quantity,
          variant,
        });
      }

      await user.save();
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Add to cart error:", error);
      return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, guest: true });
}