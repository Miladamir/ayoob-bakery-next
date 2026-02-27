import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { items } = await request.json();
        await dbConnect();

        const user = await User.findById(session.user.id);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        items.forEach((newItem: any) => {
            const existing = user.cart.find((c: any) => c.productId.toString() === newItem._id);
            if (existing) {
                // FIX: Overwrite with Guest Quantity instead of Summing
                existing.quantity = newItem.quantity;
            } else {
                user.cart.push({ productId: newItem._id, quantity: newItem.quantity });
            }
        });

        await user.save();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Cart Merge Error:", error);
        return NextResponse.json({ error: "Failed to merge cart" }, { status: 500 });
    }
}