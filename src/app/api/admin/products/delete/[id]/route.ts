import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import User from "@/models/User";
import { requireAdmin, isValidId } from "@/lib/admin";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!isValidId(id)) return NextResponse.json({ error: "Invalid product id" }, { status: 400 });

  try {
    await dbConnect();

    const product = await Product.findByIdAndDelete(id);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    /* pull the deleted product out of every user's
       cart lines and wishlist so no ghost references remain */
    await User.updateMany(
      {},
      {
        $pull: {
          "cart": { productId: id },
          "wishlist": id,
        },
      }
    );

    /* PHASE 4: revalidate every cached page this change touches —
       including the deleted product's own (now 404) page (B4) */
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/categories");
    revalidatePath("/search");
    revalidatePath(`/product/${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}