import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-service";
import { db } from "@/db/db";
import { bookings, users } from "@/db/schema";
import { eq, and, notInArray } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Correct type for Next.js 15+ params
) {
  try {
    const { id } = await params; // Await params

    if (!id) {
      return NextResponse.json(
        { error: "Missing booking ID" },
        { status: 400 }
      );
    }

    // 1. Fetch the booking to verify existence and status, joining with users for email/name
    const booking = await db
      .select({
        id: bookings.id,
        status: bookings.status,
        customerEmail: bookings.customerEmail,
        customerName: bookings.customerName,
        turfName: bookings.turfName,
        date: bookings.date,
        userEmail: users.email,
        userName: users.name,
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(eq(bookings.id, id))
      .limit(1);

    if (!booking.length) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const currentStatus = booking[0].status;

    // 2. Validate current status
    // Allow cancellation only for 'booked' or 'pending'.
    // If already 'cancelled' or 'rejected', return specific message or success (idempotency)
    if (currentStatus === "cancelled") {
      return NextResponse.json(
        { message: "Booking is already cancelled" },
        { status: 200 }
      );
    }

    if (!["confirmed", "pending"].includes(currentStatus)) {
      return NextResponse.json(
        { error: `Cannot cancel booking with status: ${currentStatus}` },
        { status: 400 }
      );
    }

    // 3. Update status to 'cancelled'
    const updatedBooking = await db
      .update(bookings)
      .set({ status: "cancelled" })
      .where(eq(bookings.id, id))
      .returning();

    // 4. Send Cancellation Email
    if (updatedBooking.length > 0) {
      console.log(
        `📌 [CancelRoute] Sending cancellation email for booking ${id} to ${booking[0].customerEmail || booking[0].userEmail}`
      );
      try {
        await sendEmail({
          to: booking[0].customerEmail || booking[0].userEmail || "",
          type: "booking_cancellation",
          data: {
            email: booking[0].customerEmail || booking[0].userEmail,
            name: booking[0].customerName || booking[0].userName,
            bookingId: booking[0].id,
            turf: booking[0].turfName,
            date: booking[0].date,
          },
        });
        console.log(`✅ [CancelRoute] Cancellation email sent successfully.`);
      } catch (emailError) {
        console.error(
          "❌ [CancelRoute] Failed to send cancellation email:",
          emailError
        );
      }
    }

    return NextResponse.json(
      { success: true, booking: updatedBooking[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cancellation Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
