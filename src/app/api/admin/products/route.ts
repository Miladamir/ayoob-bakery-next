import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { requireAdmin, sanitizeProduct } from "@/lib/admin";

export async function POST(request: Request) {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  try {
    await dbConnect();
    const body = await request.json();

    const { data, error } = sanitizeProduct(body, "create");
    if (!data) return NextResponse.json({ error: error || "Invalid product." }, { status: 400 });

    /* the referenced category must actually exist */
    const cat = await Category.findById(data.category).lean();
    if (!cat)
      return NextResponse.json({ error: "That category no longer exists." }, { status: 400 });

    const newProduct = await Product.create(data);

    /* PHASE 4: revalidate every cached page this change touches —
       the board, the aisle counts on /categories, and the search pool */
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/categories");
    revalidatePath("/search");
    revalidatePath("/menu");
    revalidatePath(`/product/${newProduct._id}`);

    return NextResponse.json({ success: true, id: newProduct._id });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}