import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { revalidatePath } from "next/cache";

// Create Product
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        const body = await request.json();

        const newProduct = await Product.create(body);

        // Revalidate public pages so changes appear immediately
        revalidatePath('/');
        revalidatePath('/products');
        revalidatePath(`/product/${newProduct._id}`);

        return NextResponse.json({ success: true, id: newProduct._id });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}