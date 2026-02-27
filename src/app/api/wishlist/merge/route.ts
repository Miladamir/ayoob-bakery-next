import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import mongoose from "mongoose"; // Import mongoose for ObjectId conversion

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { ids } = await request.json(); // Array of Strings
        await dbConnect();

        const user = await User.findById(session.user.id);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Merge logic: Convert string ID to ObjectId before pushing
        ids.forEach((id: string) => {
            if (!user.wishlist.some((existingId: any) => existingId.toString() === id)) {
                user.wishlist.push(new mongoose.Types.ObjectId(id));
            }
        });

        await user.save();
        return NextResponse.json({ success: true, count: user.wishlist.length });
    } catch (error) {
        console.error("Wishlist Merge Error:", error);
        return NextResponse.json({ error: "Failed to merge wishlist" }, { status: 500 });
    }
}