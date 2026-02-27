import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import mongoose from "mongoose"; // Import mongoose

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    await dbConnect();

    if (session?.user?.id) {
        const user = await User.findById(session.user.id);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Toggle logic
        const index = user.wishlist.findIndex((itemId: any) => itemId.toString() === id);

        if (index > -1) {
            user.wishlist.splice(index, 1);
        } else {
            // Fix: Convert string 'id' to ObjectId before pushing
            user.wishlist.push(new mongoose.Types.ObjectId(id));
        }

        await user.save();
        return NextResponse.json({ success: true, added: index === -1 });
    } else {
        // Guest handling
        return NextResponse.json({ success: true, guest: true });
    }
}