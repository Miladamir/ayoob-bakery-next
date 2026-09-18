import { NextResponse } from "next/server";
import { Resend } from "resend";
import dbConnect from "@/lib/dbConnect";
import Subscriber from "@/models/Subscriber";
import { newsletterSchema, safeJson, zodErrorMessage } from "@/lib/validate";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rateLimit";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export async function POST(request: Request) {
  /* RATE LIMIT (Phase 2): 5 subscribes per IP per hour */
  const rl = rateLimit(`newsletter:${getClientIp(request)}`, 5, 60 * 60 * 1000);
  if (!rl.ok) return tooManyRequests(rl.retryAfterMs);

  const raw = await safeJson(request);
  const parsed = newsletterSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const { email } = parsed.data;

  try {
    await dbConnect();

    // 1. friendly duplicate check (the unique index is the real guard)
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return NextResponse.json({ success: true, message: "Already subscribed" });
    }

    // 2. save to the database — a subscribe race lands here, not in a 500
    try {
      await Subscriber.create({ email });
    } catch (e: any) {
      if (e?.code === 11000) {
        return NextResponse.json({ success: true, message: "Already subscribed" });
      }
      throw e;
    }

    // 3. welcome email — a failure here never fails the request,
    //    the DB save matters more
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: "Welcome to Ayoob Bakery!",
          html: `
                    <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                        <h1 style="color: #c37560;">Welcome to the Family!</h1>
                        <p>Thanks for subscribing to Ayoob Bakery updates. Here is your 15% off code:</p>
                        <h2 style="background: #f3f4f6; padding: 10px; display: inline-block; border-radius: 8px;">BREADCLUB15</h2>
                        <p style="font-size: 12px; color: #666; margin-top: 20px;">Use this at checkout.</p>
                    </div>
                `,
        });
      } catch (emailError) {
        console.log("Email failed to send, but subscription saved.", emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}