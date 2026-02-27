import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        await dbConnect();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }

        // FIX: Do NOT hash the password here.
        // The User model's pre-save hook will hash it automatically.
        const newUser = new User({
            name,
            email,
            password: password,
            role: "user"
        });

        await newUser.save();

        return NextResponse.json({ message: "User created" }, { status: 201 });
    } catch (error) {
        console.error("Register Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}