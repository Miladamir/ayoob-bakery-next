import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const { id } = await params; // Product ID
    const body = await request.json();
    const quantity = body.quantity || 1;

    await dbConnect();

    if (session?.user?.id) {
        try {
            const user = await User.findById(session.user.id);
            if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

            // Check if item already in cart
            const existingItem = user.cart.find((item: any) => item.productId.toString() === id);

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                user.cart.push({
                    productId: new mongoose.Types.ObjectId(id),
                    quantity
                });
            }

            await user.save();
            return NextResponse.json({ success: true });
        } catch (error) {
            console.error("Add to cart error:", error);
            return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
        }
    }

    // If not logged in, the Context handles LocalStorage. 
    // We return success so the frontend doesn't crash, but DB is not touched.
    return NextResponse.json({ success: true, guest: true });
}