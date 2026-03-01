import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Subscriber from "@/models/Subscriber";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    // 1. Security Check
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, content } = await request.json();
    if (!subject || !content) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    try {
        await dbConnect();

        // 2. Get all emails
        const subscribers = await Subscriber.find({}).select('email').lean();
        if (subscribers.length === 0) {
            return NextResponse.json({ error: "No subscribers to send to" }, { status: 400 });
        }

        const emailList = subscribers.map((sub: any) => sub.email);

        // 3. Send Email
        // Note: We send to YOUR verified email, and BCC the subscribers.
        // This is the standard way to handle newsletters on simple plans.
        await resend.emails.send({
            from: 'onboarding@resend.dev', // TODO: Change to your verified domain (e.g., news@ayoobbakery.com)
            to: 'miladamiri201a@gmail.com', // TODO: Change this to YOUR admin email (Required by Resend)
            bcc: emailList, // Subscribers go here
            subject: subject,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                    <h1 style="color: #c37560;">${subject}</h1>
                    <div style="color: #333; line-height: 1.6;">
                        ${content}
                    </div>
                    <hr style="margin-top: 30px; border: 1px solid #eee;" />
                    <p style="font-size: 12px; color: #999; text-align: center;">
                        You received this email because you subscribed to Ayoob Bakery.
                    </p>
                </div>
            `,
        });

        return NextResponse.json({ success: true, count: emailList.length });

    } catch (error) {
        console.error("Newsletter Send Error:", error);
        return NextResponse.json({ error: "Failed to send" }, { status: 500 });
    }
}