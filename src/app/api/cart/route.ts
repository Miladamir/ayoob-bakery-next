import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Product from "@/models/Product";

export async function GET() {
    const session = await getServerSession(authOptions);

    // Return empty immediately if not logged in (Context handles local storage)
    if (!session?.user?.id) {
        return NextResponse.json({ items: [] });
    }

    await dbConnect();

    try {
        // 1. Fetch user with cart items (only productId and quantity)
        const user = await User.findById(session.user.id).select('cart').lean();

        if (!user || !user.cart || user.cart.length === 0) {
            return NextResponse.json({ items: [] });
        }

        // 2. Extract product IDs
        const productIds = user.cart.map((item: any) => item.productId);

        // 3. Fetch product details in one go (Optimization: $in query)
        // Only select fields necessary for the cart UI
        const products = await Product.find({ _id: { $in: productIds } })
            .select('name price images unit')
            .lean();

        // 4. Merge data in memory (faster than multiple populate calls)
        const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));

        const items = user.cart.map((cartItem: any) => {
            const product = productMap.get(cartItem.productId.toString());

            // Handle case where product was deleted
            if (!product) return null;

            return {
                _id: product._id.toString(),
                name: product.name,
                price: product.price,
                images: product.images,
                unit: product.unit,
                quantity: cartItem.quantity,
                note: cartItem.note
            };
        }).filter((item: any) => item !== null);

        return NextResponse.json({ items });

    } catch (error) {
        console.error("Cart Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
    }
}