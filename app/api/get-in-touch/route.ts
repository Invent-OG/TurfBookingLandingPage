// app/api/get-in-touch/route.ts
import { Resend } from "resend";
import { NextResponse } from "next/server";
import { z } from "zod";
import SportyContactEmail from "@/components/email/SportyContactEmail";

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

    // Send to admin using Sporty Template
    await resend.emails.send({
      from: "Get in Touch <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `New message from ${name}`,
      react: SportyContactEmail({
        name,
        email,
        message,
      }),
    });

    // Optional: Send sporty confirmation to user
    await resend.emails.send({
      from: "Turf Support <onboarding@resend.dev>",
      to: [email],
      subject: "We received your message! ⚽",
      html: `
        <div style="background: #000; color: #fff; padding: 20px; font-family: sans-serif; text-align: center;">
          <h2 style="color: #ccff00; font-style: italic;">MESSAGE RECEIVED!</h2>
          <p>Hi ${name},</p>
          <p>Thanks for touching base. Our team is warming up and will get back to you shortly.</p>
          <div style="margin-top: 20px; border-top: 1px solid #333; padding-top: 10px;">
             <p style="color: #666; font-size: 12px;">TURFBOOK SUPPORT</p>
          </div>
        </div>
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
