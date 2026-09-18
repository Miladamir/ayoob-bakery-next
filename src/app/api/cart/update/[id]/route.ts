import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { cartUpdateSchema, isValidId, safeJson, zodErrorMessage } from "@/lib/validate";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!isValidId(id)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  /* SECURITY FIX (S3): quantity is now a whole number 1–99.
     (A malformed body used to crash this route with a 500.) */
  const raw = await safeJson(request);
  const parsed = cartUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });
  }
  const { quantity, variant } = parsed.data;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const item = user.cart.find(
      (c: any) => c.productId.toString() === id && (c.variant || null) === variant
    );
    if (item) {
      item.quantity = quantity;
      await user.save();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  } catch (error) {
    console.error("Cart update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}