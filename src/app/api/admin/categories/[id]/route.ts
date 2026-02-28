import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await dbConnect();
        const body = await request.json();

        if (body.category === "") body.category = null; // Handle empty category selection

        const category = await Category.findByIdAndUpdate(id, body, { new: true });
        if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

        revalidatePath('/');
        revalidatePath('/categories');
        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
    }
}