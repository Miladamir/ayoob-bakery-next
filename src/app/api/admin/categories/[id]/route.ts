import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import { requireAdmin, sanitizeCategory, isValidId } from "@/lib/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!isValidId(id)) return NextResponse.json({ error: "Invalid category id" }, { status: 400 });

  try {
    await dbConnect();
    const body = await request.json();

    const { data, error } = sanitizeCategory(body, "update");
    if (!data) return NextResponse.json({ error: error || "Invalid category." }, { status: 400 });

    /* a category can't be its own parent */
    if (data.parent && data.parent === id)
      return NextResponse.json({ error: "A category can't be its own parent." }, { status: 400 });

    /* parent must exist when set */
    if (data.parent) {
      const parent = await Category.findById(data.parent).lean();
      if (!parent)
        return NextResponse.json({ error: "Parent category no longer exists." }, { status: 400 });
    }

    const category = await Category.findByIdAndUpdate(id, data, { new: true });
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    /* PHASE 4: revalidate every cached page this change touches */
    revalidatePath("/");
    revalidatePath("/categories");
    revalidatePath("/products");
    revalidatePath("/search");

    return NextResponse.json(category);
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}