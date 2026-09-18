import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import mongoose from "mongoose";
import { isValidId } from "@/lib/validate";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  /* SECURITY FIX (S3): an invalid id used to crash the ObjectId
     constructor → unhandled 500. */
  if (!isValidId(id)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  await dbConnect();

  if (session?.user?.id) {
    try {
      const user = await User.findById(session.user.id);
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const index = user.wishlist.findIndex(
        (itemId: any) => itemId.toString() === id
      );

      if (index > -1) {
        user.wishlist.splice(index, 1);
      } else {
        user.wishlist.push(new mongoose.Types.ObjectId(id));
      }

      await user.save();
      return NextResponse.json({ success: true, added: index === -1 });
    } catch (error) {
      console.error("Wishlist toggle error:", error);
      return NextResponse.json({ error: "Failed to toggle wishlist" }, { status: 500 });
    }
  } else {
    return NextResponse.json({ success: true, guest: true });
  }
}