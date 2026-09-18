import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import mongoose from "mongoose";
import { safeJson, wishlistMergeSchema, zodErrorMessage } from "@/lib/validate";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /* SECURITY FIX (S3): `ids` came straight from localStorage — a
     non-array crashed the route and invalid ids crashed the ObjectId
     constructor, both as unhandled 500s. */
  const raw = await safeJson(request);
  const parsed = wishlistMergeSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });
  }
  const { ids } = parsed.data;

  try {
    await dbConnect();

    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    ids.forEach((id) => {
      if (!user.wishlist.some((existingId: any) => existingId.toString() === id)) {
        user.wishlist.push(new mongoose.Types.ObjectId(id));
      }
    });

    await user.save();
    return NextResponse.json({ success: true, count: user.wishlist.length });
  } catch (error) {
    console.error("Wishlist Merge Error:", error);
    return NextResponse.json({ error: "Failed to merge wishlist" }, { status: 500 });
  }
}