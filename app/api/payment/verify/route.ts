import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // 1. Check current status in DB
    const bookingResults = await db
      .select({ status: bookings.status })
      .from(bookings)
      .where(eq(bookings.id, bookingId));

    const booking = bookingResults[0];

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "booked") {
      return NextResponse.json({ status: "booked" });
    }

    // 2. If not booked, check Cashfree
    const APP_ID = process.env.CASHFREE_APP_ID;
    const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
    const ENV_MODE = process.env.CASHFREE_ENV;

    if (!APP_ID || !SECRET_KEY) {
      return NextResponse.json(
        { error: "Missing Cashfree Credentials" },
        { status: 500 }
      );
    }

    const BASE_URL =
      ENV_MODE === "LIVE"
        ? "https://api.cashfree.com/pg/orders"
        : "https://sandbox.cashfree.com/pg/orders";

    const response = await fetch(`${BASE_URL}/${bookingId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": APP_ID,
        "x-client-secret": SECRET_KEY,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Cashfree Verification Failed:", data);
      return NextResponse.json(
        { error: "Failed to verify payment" },
        { status: 500 }
      );
    }

    const paymentStatus = data.order_status; // "PAID", "ACTIVE", "EXPIRED"

    if (paymentStatus === "PAID") {
      console.log(`✅ Payment Verified for ${bookingId}. Updating DB...`);

      // Update status to 'booked'
      await db
        .update(bookings)
        .set({ status: "booked" })
        .where(eq(bookings.id, bookingId));

      return NextResponse.json({ status: "booked" });
    } else {
      return NextResponse.json({
        status: "pending",
        cashfreeStatus: paymentStatus,
      });
    }
  } catch (error) {
    console.error("❌ Verify Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
