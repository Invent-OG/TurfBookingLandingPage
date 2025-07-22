// app/api/send-email/route.ts (Next.js App Router)
import BookingConfirmation from "@/components/email/BookingConfirmation";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email, name, turf, date, time, duration, bookingId, amount, phone } =
    await req.json();

  try {
    const data = await resend.emails.send({
      from: "Bookings <onboarding@resend.dev>",
      to: [email],
      subject: "Booking Confirmation",
      react: BookingConfirmation({
        userName: name,
        bookingId, // Replace with actual booking ID
        date,
        email,
        phone,
        startTime: time,
        duration,
        amount,
        turf,
      }),
    });

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json(
      { error: "Email failed to send", detail: error },
      { status: 500 }
    );
  }
}
