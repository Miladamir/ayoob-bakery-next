import { NextResponse } from "next/server";
import { Resend } from "resend";
import dbConnect from "@/lib/dbConnect";
import Subscriber from "@/models/Subscriber";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    try {
        await dbConnect();

        // 1. Check if already subscribed
        const existing = await Subscriber.findOne({ email });
        if (existing) {
            return NextResponse.json({ success: true, message: "Already subscribed" });
        }

        // 2. Save to Database
        await Subscriber.create({ email });

        // 3. Send Welcome Email (Optional but recommended)
        // Replace 'onboarding@resend.dev' with your verified domain email in production
        if (process.env.RESEND_API_KEY) {
            try {
                await resend.emails.send({
                    from: 'onboarding@resend.dev', // TODO: Change this to your domain email in production
                    to: email,
                    subject: 'Welcome to Ayoob Bakery!',
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
                // We don't fail the request if email fails, the DB save is more important
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Newsletter Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}