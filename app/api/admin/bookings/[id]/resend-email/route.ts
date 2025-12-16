import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { bookings, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/email-service";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const bookingResults = await db
      .select({
        id: bookings.id,
        date: bookings.date,
        startTime: bookings.startTime,
        duration: bookings.duration,
        totalPrice: bookings.totalPrice,
        turfName: bookings.turfName,
        customerName: bookings.customerName,
        customerEmail: bookings.customerEmail,
        customerPhone: bookings.customerPhone,
        userName: users.name,
        userEmail: users.email,
        status: bookings.status,
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);

    const booking = bookingResults[0];

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const email = booking.customerEmail || booking.userEmail;
    const name = booking.customerName || booking.userName;

    if (!email) {
      return NextResponse.json(
        { error: "No email address associated with this booking" },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to: email,
      type: "booking_confirmation",
      data: {
        email,
        name,
        bookingId: booking.id,
        date: booking.date,
        time: booking.startTime,
        duration: booking.duration,
        amount: booking.totalPrice,
        turf: booking.turfName,
        phone: booking.customerPhone,
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send email", details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email resent successfully",
    });
  } catch (error) {
    console.error("Error resending email:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
