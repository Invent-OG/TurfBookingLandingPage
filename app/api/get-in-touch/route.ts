// app/api/get-in-touch/route.ts
import { Resend } from "resend";
import { NextResponse } from "next/server";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  name: z.string(),
  email: z.string().email(),
  message: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name, email, message } = parsed.data;

    const adminEmail = process.env.ADMIN_EMAIL || "your@email.com";

    // Send to admin
    await resend.emails.send({
      from: "Get in Touch <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `New message from ${name}`,
      html: `
        <h2>You've received a new message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>
      `,
    });

    // Optional: Send confirmation to user
    await resend.emails.send({
      from: "Turf Support <onboarding@resend.dev>",
      to: [email],
      subject: "We received your message!",
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for reaching out! We've received your message and will get back to you shortly.</p>
        <p><em>Here's a copy of your message:</em></p>
        <blockquote>${message.replace(/\n/g, "<br/>")}</blockquote>
        <br/>
        <p>Best regards,<br/>The Turf Team</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in Get in Touch API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
