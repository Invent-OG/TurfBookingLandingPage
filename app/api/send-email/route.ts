import SportyBookingConfirmation from "@/components/email/SportyBookingConfirmation";
import SportyPaymentFailure from "@/components/email/SportyPaymentFailure";
import SportyEventRegistration from "@/components/email/SportyEventRegistration";
import SportyRefundProcessed from "@/components/email/SportyRefundProcessed";
import SportyBookingCancellation from "@/components/email/SportyBookingCancellation";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.json();
  const { type = "booking_confirmation", ...data } = body;

  try {
    let emailComponent;
    let subject;

    switch (type) {
      case "booking_confirmation":
        subject = `Booking Confirmation - ${data.turf || "TurfBook"}`;
        emailComponent = SportyBookingConfirmation({
          userName: data.name || data.userName,
          bookingId: data.bookingId,
          date: data.date,
          email: data.email,
          phone: data.phone,
          startTime: data.time || data.startTime,
          duration: data.duration,
          amount: data.amount,
          turf: data.turf,
        });
        break;

      case "payment_failure":
        subject = "Payment Failed - Action Required";
        emailComponent = SportyPaymentFailure({
          userName: data.name || data.userName,
          bookingId: data.bookingId,
          amount: data.amount,
          turf: data.turf,
        });
        break;

      case "event_registration":
        subject = `Event Registration: ${data.eventName || "Turf Event"}`;
        emailComponent = SportyEventRegistration({
          userName: data.name || data.userName,
          eventName: data.eventName,
          eventDate: data.eventDate,
          teamName: data.teamName,
          amount: data.amount,
          registrationId: data.registrationId,
        });
        break;

      case "refund_processed":
        subject = "Refund Processed - TurfBook";
        emailComponent = SportyRefundProcessed({
          userName: data.name || data.userName,
          bookingId: data.bookingId,
          amount: data.amount,
          date: data.date,
        });
        break;

      case "booking_cancellation":
        subject = "Booking Cancelled";
        emailComponent = SportyBookingCancellation({
          userName: data.name || data.userName,
          bookingId: data.bookingId,
          turf: data.turf,
          date: data.date,
        });
        break;

      default:
        throw new Error("Invalid email type");
    }

    const emailData = await resend.emails.send({
      from: "TurfBook <onboarding@resend.dev>",
      to: [data.email || data.to],
      subject: subject,
      react: emailComponent,
    });

    return Response.json({ success: true, data: emailData });
  } catch (error) {
    console.error("Email send error:", error);
    return Response.json(
      { error: "Email failed to send", detail: error },
      { status: 500 }
    );
  }
}
