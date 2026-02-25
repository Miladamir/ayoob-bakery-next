import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { firstName, lastName, email, subject, message } = data;

        // In a real application, you would send an email here using
        // a service like Resend, SendGrid, or Nodemailer.
        // For now, we just log it to the console.
        console.log("Contact Form Submission:");
        console.log(`Name: ${firstName} ${lastName}`);
        console.log(`Email: ${email}`);
        console.log(`Subject: ${subject}`);
        console.log(`Message: ${message}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}