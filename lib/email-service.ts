import { Resend } from "resend";
import SportyBookingConfirmation from "@/components/email/SportyBookingConfirmation";
import SportyPaymentFailure from "@/components/email/SportyPaymentFailure";
import SportyEventRegistration from "@/components/email/SportyEventRegistration";
import SportyRefundProcessed from "@/components/email/SportyRefundProcessed";
import SportyBookingCancellation from "@/components/email/SportyBookingCancellation";

const resend = new Resend(process.env.RESEND_API_KEY);

export type EmailType =
  | "booking_confirmation"
  | "payment_failure"
  | "event_registration"
  | "refund_processed"
  | "booking_cancellation";

interface EmailPayload {
  to: string;
  type: EmailType;
  data: any;
}

export async function sendEmail({ to, type, data }: EmailPayload) {
  console.log(`📧 [EmailService] Attempting to send '${type}' email to: ${to}`);

  if (!process.env.RESEND_API_KEY) {
    console.error(
      "❌ [EmailService] RESEND_API_KEY is completely missing from process.env"
    );
    throw new Error("Missing Email API Key");
  } else {
    console.log(
      `🔑 [EmailService] API Key present (starts with: ${process.env.RESEND_API_KEY.substring(0, 5)}...)`
    );
  }

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

    const response = await resend.emails.send({
      from: "TurfBook <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      react: emailComponent,
    });

    if (response.error) {
      console.error(
        `❌ [EmailService] Resend API Validation Error:`,
        response.error
      );
      return { success: false, error: response.error };
    }

    console.log(`✅ Email sent (${type}) to ${to}`, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`❌ Email send error (${type}):`, error);
    return { success: false, error };
  }
}
