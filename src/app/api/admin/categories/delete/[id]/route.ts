import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { requireAdmin, isValidId } from "@/lib/admin";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!isValidId(id)) return NextResponse.json({ error: "Invalid category id" }, { status: 400 });

  try {
    await dbConnect();

    const category = await Category.findById(id).lean();
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    /* products pointing at this category would dangle —
       make the admin move or delete them first (clear message) */
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0)
      return NextResponse.json(
        {
          error: `This category still holds ${productCount} product${
            productCount === 1 ? "" : "s"
          }. Move or delete them first.`,
        },
        { status: 409 }
      );

    /* lift subcategories to top-level instead of orphaning them */
    await Category.updateMany({ parent: id }, { $set: { parent: null } });

    await Category.findByIdAndDelete(id);

    /* PHASE 4: revalidate every cached page this change touches */
    revalidatePath("/");
    revalidatePath("/categories");
    revalidatePath("/products");
    revalidatePath("/search");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}