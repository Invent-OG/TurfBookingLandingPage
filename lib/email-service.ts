import { Resend } from "resend";
import SportyBookingConfirmation from "@/components/email/SportyBookingConfirmation";
import SportyPaymentFailure from "@/components/email/SportyPaymentFailure";
import SportyEventRegistration from "@/components/email/SportyEventRegistration";
import SportyRefundProcessed from "@/components/email/SportyRefundProcessed";
import SportyBookingCancellation from "@/components/email/SportyBookingCancellation";
import SportyContactEmail from "@/components/email/SportyContactEmail";
import { db } from "@/db/db";
import { siteSettings } from "@/db/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

export type EmailType =
  | "booking_confirmation"
  | "payment_failure"
  | "event_registration"
  | "refund_processed"
  | "booking_cancellation"
  | "contact_submission";

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
    // Fetch Site Settings
    const settings = await db.select().from(siteSettings).limit(1);
    const companyName = settings[0]?.companyName || "KRP Sports Zone";
    const supportPhone = settings[0]?.supportPhone || "+91 88838 88025";
    const supportEmail =
      settings[0]?.supportEmail || "support@krpsportszone.com";
    const logoUrl =
      settings[0]?.logoUrl || "https://krpsportszone.com/logo.png";

    let emailComponent;
    let subject;

    switch (type) {
      case "booking_confirmation":
        subject = `Booking Confirmation - ${data.turf || "KRP Sports Zone"}`;
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
          companyName,
          supportPhone,
          logoUrl,
        });
        break;

      case "payment_failure":
        subject = "Payment Failed - Action Required";
        emailComponent = SportyPaymentFailure({
          userName: data.name || data.userName,
          bookingId: data.bookingId,
          amount: data.amount,
          turf: data.turf,
          companyName,
          supportPhone,
          logoUrl,
        });
        break;

      case "event_registration":
        subject = `Event Registration: ${data.eventName || "KRP Sports Zone Event"}`;
        emailComponent = SportyEventRegistration({
          userName: data.name || data.userName,
          eventName: data.eventName,
          eventDate: data.eventDate,
          teamName: data.teamName,
          amount: data.amount,
          registrationId: data.registrationId,
          companyName,
          supportPhone,
          logoUrl,
        });
        break;

      case "refund_processed":
        subject = "Refund Processed - KRP Sports Zone";
        emailComponent = SportyRefundProcessed({
          userName: data.name || data.userName,
          bookingId: data.bookingId,
          amount: data.amount,
          date: data.date,
          companyName,
          supportPhone,
          logoUrl,
        });
        break;

      case "booking_cancellation":
        subject = "Booking Cancelled";
        emailComponent = SportyBookingCancellation({
          userName: data.name || data.userName,
          bookingId: data.bookingId,
          turf: data.turf,
          date: data.date,
          companyName,
          supportPhone,
          logoUrl,
        });
        break;

      case "contact_submission":
        subject = `New Inquiry: ${data.name}`;
        emailComponent = SportyContactEmail({
          name: data.name,
          email: data.email,
          message: data.message,
          companyName,
          logoUrl,
        });
        break;

      default:
        throw new Error("Invalid email type");
    }

    const response = await resend.emails.send({
      from: `${companyName} <bookings@krpsportszone.com>`,
      to: [to],
      subject: subject,
      react: emailComponent,
    });

    if (response.error) {
      console.error(
        `❌ [EmailService] Resend API Validation Error:`,
        response.error
      );

      // Handle specific Sandbox error
      if (
        response.error.name === "validation_error" &&
        response.error.message.includes(
          "only send testing emails to your own email address"
        )
      ) {
        return {
          success: false,
          error: `SANDBOX LIMITATION: You can only send emails to ${process.env.RESEND_REGISTERED_EMAIL || "your registered email"} until you verify a domain.`,
        };
      }

      return {
        success: false,
        error: response.error.message || "Failed to send email",
      };
    }

    console.log(`✅ Email sent (${type}) to ${to}`, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`❌ Email send error (${type}):`, error);
    return { success: false, error };
  }
}
