import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema, safeJson, zodErrorMessage } from "@/lib/validate";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rateLimit";

const resend = new Resend(process.env.RESEND_API_KEY);

/* env-driven addresses (no more personal email hardcoded in the repo);
   falls back to the legacy values so nothing breaks if unset */
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "miladamiri201a@gmail.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

/** escape user text before it lands inside the email's HTML */
const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function POST(request: Request) {
  /* RATE LIMIT (Phase 2): 3 submissions per IP per hour */
  const rl = rateLimit(`contact:${getClientIp(request)}`, 3, 60 * 60 * 1000);
  if (!rl.ok) return tooManyRequests(rl.retryAfterMs);

  const raw = await safeJson(request);
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });
  }

  const { firstName, lastName, email, subject, message } = parsed.data;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `New Contact: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${esc(firstName)} ${esc(lastName)}</p>
        <p><strong>Email:</strong> ${esc(email)}</p>
        <p><strong>Subject:</strong> ${esc(subject)}</p>
        <hr />
        <p>${esc(message)}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact Error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}