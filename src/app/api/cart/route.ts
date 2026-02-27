import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Product from "@/models/Product"; // <--- CRITICAL FIX: Import Product model

export async function GET() {
    const session = await getServerSession(authOptions);
    await dbConnect();

    if (session?.user?.id) {
        // Now .populate works because Product schema is registered
        const user = await User.findById(session.user.id).populate('cart.productId');

        if (!user) {
            return NextResponse.json({ items: [] });
        }

        const items = user.cart.map((item: any) => {
            if (!item.productId) return null;
            return {
                _id: item.productId._id.toString(),
                name: item.productId.name,
                price: item.productId.price,
                images: item.productId.images,
                unit: item.productId.unit,
                quantity: item.quantity,
                note: item.note
            };
        }).filter((item: any) => item !== null);

        return NextResponse.json({ items });
    }

    return NextResponse.json({ items: [] });
}