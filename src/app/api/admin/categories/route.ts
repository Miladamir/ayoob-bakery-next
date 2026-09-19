import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import { requireAdmin, sanitizeCategory, escapeRegex, isValidId } from "@/lib/admin";

export async function POST(request: Request) {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  try {
    await dbConnect();
    const body = await request.json();

    const { data, error } = sanitizeCategory(body, "create");
    if (!data) return NextResponse.json({ error: error || "Invalid category." }, { status: 400 });

    /* parent must exist when set */
    if (data.parent) {
      const parent = await Category.findById(data.parent).lean();
      if (!parent)
        return NextResponse.json({ error: "Parent category no longer exists." }, { status: 400 });
    }

    /* friendly duplicate-name error (case-insensitive) */
    const existing = await Category.findOne({
      name: new RegExp(`^${escapeRegex(String(data.name))}$`, "i"),
    }).lean();
    if (existing)
      return NextResponse.json(
        { error: `A category called "${data.name}" already exists.` },
        { status: 409 }
      );

    const newCat = await Category.create(data);

    /* PHASE 4: revalidate every cached page this change touches —
       including the search pool, which carries category names */
    revalidatePath("/");
    revalidatePath("/categories");
    revalidatePath("/products");
    revalidatePath("/search");
    revalidatePath("/menu");

    return NextResponse.json({ success: true, id: newCat._id });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}