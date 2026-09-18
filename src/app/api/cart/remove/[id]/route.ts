import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { cartRemoveSchema, isValidId, safeJson, zodErrorMessage } from "@/lib/validate";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!isValidId(id)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const raw = await safeJson(request);
  const parsed = cartRemoveSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });
  }
  const { variant } = parsed.data;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    /* scope the pull to THIS variant's line only.
       { variant: null } matches null OR missing — legacy lines have no
       variant field, so they still match when variant is null. */
    await User.findByIdAndUpdate(session.user.id, {
      $pull: { cart: { productId: id, variant } },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart remove error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}