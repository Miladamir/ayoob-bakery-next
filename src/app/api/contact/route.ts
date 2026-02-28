import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    subject: z.string(),
    message: z.string(),
});

export async function POST(request: Request) {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { firstName, lastName, email, subject, message } = result.data;

    try {
        // Send email to the Bakery Owner
        await resend.emails.send({
            from: 'onboarding@resend.dev', // Change this to your verified domain later (e.g., info@ayoobbakery.com)
            to: 'your-email@example.com', // CHANGE THIS to your personal email to receive messages
            subject: `New Contact: ${subject}`,
            html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p>${message}</p>
      `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Contact Error:", error);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}