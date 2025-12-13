import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const body = await req.json().catch(() => ({}));
    const { amount } = body; // Optional: allow partial refund logic later, for now we do full refund

    // 1. Fetch Booking
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "refunded") {
      return NextResponse.json(
        { error: "Booking is already refunded" },
        { status: 400 }
      );
    }

    // 2. Validate Environment Variables
    const APP_ID = process.env.CASHFREE_APP_ID;
    const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
    const ENV_MODE = process.env.CASHFREE_ENV || "SANDBOX";
    const BASE_URL =
      ENV_MODE === "LIVE"
        ? "https://api.cashfree.com/pg/orders"
        : "https://sandbox.cashfree.com/pg/orders";

    if (!APP_ID || !SECRET_KEY) {
      return NextResponse.json(
        { error: "Missing Payment Credentials" },
        { status: 500 }
      );
    }

    // 3. Initiate Refund with Cashfree
    // Using bookingId as order_id based on assumption/convention
    const refundId = `ref_${bookingId}_${Date.now()}`;
    const refundAmount = amount || Number(booking.totalPrice);

    console.log(
      `💸 Initiating Refund for Order: ${bookingId}, Amount: ${refundAmount}`
    );

    const cashfreeRes = await fetch(`${BASE_URL}/${bookingId}/refunds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": APP_ID,
        "x-client-secret": SECRET_KEY,
      },
      body: JSON.stringify({
        refund_amount: refundAmount,
        refund_id: refundId,
        refund_note: "Admin initiated refund",
      }),
    });

    const cashfreeData = await cashfreeRes.json();
    console.log("🔍 Cashfree Refund Response:", cashfreeData);

    if (!cashfreeRes.ok) {
      // If order does not exist at Cashfree or other error
      return NextResponse.json(
        {
          error:
            cashfreeData.message ||
            "Failed to process refund with Payment Gateway",
        },
        { status: cashfreeRes.status }
      );
    }

    // 4. Update Booking Status
    await db
      .update(bookings)
      .set({ status: "refunded" })
      .where(eq(bookings.id, bookingId));

    // 5. Send Refund Email
    fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/send-email`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "refund_processed",
          email: booking.customerEmail,
          name: booking.customerName,
          bookingId: booking.id,
          amount: refundAmount,
          date: new Date().toISOString().split("T")[0],
        }),
      }
    ).catch((err) => console.error("Failed to send refund email:", err));

    return NextResponse.json({
      success: true,
      message: "Refund initiated successfully",
      data: cashfreeData,
    });
  } catch (error) {
    console.error("Refund Error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
