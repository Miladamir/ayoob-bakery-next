import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { requireAdmin, sanitizeProduct, isValidId } from "@/lib/admin";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!isValidId(id)) return NextResponse.json({ error: "Invalid product id" }, { status: 400 });

  try {
    await dbConnect();
    const product = await Product.findById(id).populate("category");
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!isValidId(id)) return NextResponse.json({ error: "Invalid product id" }, { status: 400 });

  try {
    await dbConnect();
    const body = await request.json();

    const { data, error } = sanitizeProduct(body, "update");
    if (!data) return NextResponse.json({ error: error || "Invalid product." }, { status: 400 });

    /* if the category is being changed, it must exist */
    if (data.category) {
      const cat = await Category.findById(data.category).lean();
      if (!cat)
        return NextResponse.json({ error: "That category no longer exists." }, { status: 400 });
    }

    const product = await Product.findByIdAndUpdate(id, data, { new: true });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    /* PHASE 4: revalidate every cached page this change touches */
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/categories");
    revalidatePath("/search");
    revalidatePath("/menu");
    revalidatePath(`/product/${id}`);

    return NextResponse.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}