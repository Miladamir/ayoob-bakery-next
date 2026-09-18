import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Product from "@/models/Product";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ items: [] });
    }

    await dbConnect();

    try {
        const user = await User.findById(session.user.id).select('cart').lean();

        if (!user || !user.cart || user.cart.length === 0) {
            return NextResponse.json({ items: [] });
        }

        const productIds = user.cart.map((item: any) => item.productId);

        const products = await Product.find({ _id: { $in: productIds } })
            .select('name price images unit')
            .lean();

        const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));

        /* each cart LINE is its own item — two variants of one product
           are two lines sharing one product record */
        const items = user.cart.map((cartItem: any) => {
            const product = productMap.get(cartItem.productId.toString());
            if (!product) return null;

            return {
                _id: product._id.toString(),
                name: product.name,
                price: product.price,
                images: product.images,
                unit: product.unit,
                quantity: cartItem.quantity,
                note: cartItem.note,
                variant: cartItem.variant || undefined,
            };
        }).filter((item: any) => item !== null);

        return NextResponse.json({ items });
    } catch (error) {
        console.error("Cart Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
    }
}