import { NextResponse } from "next/server";
import { z } from "zod";

// Define schema for strict validation
const contactSchema = z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    email: z.string().email(),
    subject: z.string().min(3).max(100),
    message: z.string().min(10).max(1000),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const result = contactSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ success: false, message: "Invalid input data." }, { status: 400 });
        }

        const { firstName, lastName, email, subject, message } = result.data;

        // In production: Send email using Resend, SendGrid, or save to DB.
        console.log(`Contact Form: ${firstName} ${lastName} (${email}) - ${subject}`);

        return NextResponse.json({ success: true, message: "Message sent successfully!" });

    } catch (error) {
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}