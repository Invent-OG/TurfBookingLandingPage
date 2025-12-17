import { Resend } from "resend";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email-service";

import { db } from "@/db/db";
import { siteSettings } from "@/db/schema";

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

    // Fetch Admin Email from Site Settings
    const settings = await db.select().from(siteSettings).limit(1);
    const adminEmail =
      settings[0]?.supportEmail || process.env.ADMIN_EMAIL || "your@email.com";

    // 1. Send to Admin (via reliable service)
    await sendEmail({
      to: adminEmail,
      type: "contact_submission",
      data: { name, email, message },
    });

    // 2. Send Acknowledgment to User (Direct Resend for custom HTML for now)
    await resend.emails.send({
      from: "KRP Sports Zone <bookings@krpsportszone.com>",
      to: [email],
      subject: "We received your message! ⚽",
      html: `
        <div style="background: #000; color: #fff; padding: 20px; font-family: sans-serif; text-align: center;">
          <h2 style="color: #ccff00; font-style: italic;">MESSAGE RECEIVED!</h2>
          <p>Hi ${name},</p>
          <p>Thanks for touching base. Our team is warming up and will get back to you shortly.</p>
          <div style="margin-top: 20px; border-top: 1px solid #333; padding-top: 10px;">
             <p style="color: #666; font-size: 12px;">KRP SPORTS ZONE SUPPORT</p>
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
