import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { eventRegistrations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { registrationId } = await req.json();

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID is required" },
        { status: 400 }
      );
    }

    // 1. Check current status
    const result = await db
      .select({ paymentStatus: eventRegistrations.paymentStatus })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.id, registrationId))
      .limit(1);

    const registration = result[0];

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    if (registration.paymentStatus === "paid") {
      return NextResponse.json({ status: "paid" });
    }

    // 2. Verify with Cashfree
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

    const response = await fetch(`${BASE_URL}/${registrationId}`, {
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
      return NextResponse.json(
        { error: "Failed to verify payment" },
        { status: 500 }
      );
    }

    const paymentStatus = data.order_status; // "PAID", "ACTIVE", "EXPIRED"

    if (paymentStatus === "PAID") {
      await db
        .update(eventRegistrations)
        .set({ paymentStatus: "paid" })
        .where(eq(eventRegistrations.id, registrationId));

      return NextResponse.json({ status: "paid" });
    } else {
      return NextResponse.json({
        status: "pending",
        cashfreeStatus: paymentStatus,
      });
    }
  } catch (error) {
    console.error("Verify Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
