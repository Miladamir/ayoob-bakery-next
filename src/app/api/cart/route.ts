import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

// GET: Retrieve current cart
export async function GET() {
    const session = await getServerSession(authOptions);
    await dbConnect();

    // Check if session and user exist
    if (session?.user?.id) {
        const user = await User.findById(session.user.id).populate('cart.productId');

        // Fix: Check if user was actually found
        if (user) {
            // Transform MongoDB objects to plain JSON for the frontend
            // Also filter out items where the product might have been deleted (productId is null)
            const items = user.cart
                .filter((item: any) => item.productId) // Ensure product exists
                .map((item: any) => ({
                    _id: item.productId._id.toString(),
                    name: item.productId.name,
                    price: item.productId.price,
                    images: item.productId.images,
                    unit: item.productId.unit,
                    quantity: item.quantity,
                    note: item.note
                }));
            return NextResponse.json({ items });
        }
    }

    // If no session or no user, return empty
    return NextResponse.json({ items: [] });
}