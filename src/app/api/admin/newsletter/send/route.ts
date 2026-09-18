import { NextResponse } from "next/server";
import { Resend } from "resend";
import dbConnect from "@/lib/dbConnect";
import Subscriber from "@/models/Subscriber";
import { requireAdmin } from "@/lib/admin";
import { newsletterSendSchema, safeJson, zodErrorMessage } from "@/lib/validate";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rateLimit";

const resend = new Resend(process.env.RESEND_API_KEY);

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "miladamiri201a@gmail.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function POST(request: Request) {
    // 1. Security Check — unified on requireAdmin (Phase 2)
    const { denied } = await requireAdmin();
    if (denied) return denied;

    // 2. Even admin actions get a light cap — a compromised session
    //    shouldn't be able to hammer thousands of sends (Phase 2)
    const rl = rateLimit(`nl-send:${getClientIp(request)}`, 6, 60 * 60 * 1000);
    if (!rl.ok) return tooManyRequests(rl.retryAfterMs);

    // 3. Validate — subject has newlines stripped (email-header injection),
    //    content is admin-authored HTML by design, just capped
    const raw = await safeJson(request, 300_000);
    const parsed = newsletterSendSchema.safeParse(raw);
    if (!parsed.success) {
        return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });
    }
    const { subject, content } = parsed.data;

    try {
        await dbConnect();

        // 4. Get all emails
        const subscribers = await Subscriber.find({}).select('email').lean();
        if (subscribers.length === 0) {
            return NextResponse.json({ error: "No subscribers to send to" }, { status: 400 });
        }

        const emailList = subscribers.map((sub: any) => sub.email);

        // 5. Send Email
        // Note: We send to YOUR verified email, and BCC the subscribers.
        // This is the standard way to handle newsletters on simple plans.
        await resend.emails.send({
            from: FROM_EMAIL,
            to: TO_EMAIL,
            bcc: emailList, // Subscribers go here
            subject: subject,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                    <h1 style="color: #c37560;">${esc(subject)}</h1>
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