import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { bookings } from "@/db/schema";
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

    // 1. Fetch the booking to verify existence and status
    const booking = await db
      .select()
      .from(bookings)
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

    if (!["booked", "pending"].includes(currentStatus)) {
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
