import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { registerSchema, safeJson, zodErrorMessage } from "@/lib/validate";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rateLimit";
import { findUserByEmail } from "@/lib/users";

export async function POST(request: Request) {
  try {
    /* RATE LIMIT (Phase 2): 10 new accounts per IP per hour */
    const rl = rateLimit(`register:${getClientIp(request)}`, 10, 60 * 60 * 1000);
    if (!rl.ok) return tooManyRequests(rl.retryAfterMs);

    const raw = await safeJson(request);
    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ message: zodErrorMessage(parsed.error) }, { status: 400 });
    }

    /* PHASE 8: emails are stored lowercase — one canonical account
       per person, logins work in any casing */
    const { name, password } = parsed.data;
    const email = parsed.data.email.toLowerCase();

    await dbConnect();

    /* PHASE 8: case-insensitive duplicate check — Foo@x.com can no
       longer register over an existing foo@x.com */
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    /* password hashing happens in the model's pre-save hook */
    const newUser = new User({ name, email, password, role: "user" });

    try {
      await newUser.save();
    } catch (saveError: any) {
      /* two signups racing on the same email: the unique index wins */
      if (saveError?.code === 11000) {
        return NextResponse.json({ message: "User already exists" }, { status: 400 });
      }
      throw saveError;
    }

    return NextResponse.json({ message: "User created" }, { status: 201 });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}