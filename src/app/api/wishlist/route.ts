import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

// GET: Retrieve current wishlist IDs
export async function GET() {
    const session = await getServerSession(authOptions);
    await dbConnect();

    // Check if session and user ID exist
    if (session?.user?.id) {
        const user = await User.findById(session.user.id);

        // Fix: Check if user was found before accessing wishlist
        if (user) {
            const ids = user.wishlist.map((id: any) => id.toString());
            return NextResponse.json({ ids });
        }
    }

    return NextResponse.json({ ids: [] });
}