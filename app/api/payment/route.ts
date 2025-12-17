import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("🔥 Cashfree API Called...");

    const {
      order_id,
      order_amount,
      customer_email,
      customer_phone,
      customer_name,
    } = await req.json();

    // Check if required environment variables exist
    const APP_ID = process.env.CASHFREE_APP_ID;
    const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
    const ENV_MODE = process.env.CASHFREE_ENV;

    if (!APP_ID || !SECRET_KEY) {
      console.error("❌ Missing Cashfree Credentials");
      return NextResponse.json(
        { error: "Missing Cashfree Credentials" },
        { status: 500 }
      );
    }

    console.log("test");

    // Determine API endpoint based on environment mode
    const BASE_URL =
      ENV_MODE === "LIVE"
        ? "https://api.cashfree.com/pg/orders"
        : "https://sandbox.cashfree.com/pg/orders";

    // Set return and notification URLs from environment variables
    const RETURN_URL = process.env.CASHFREE_RETURN_URL;
    const NOTIFICATION_URL = process.env.CASHFREE_NOTIFICATION_URL;

    console.log(`🌍 Using ${ENV_MODE} environment`);
    console.log("🔗 API Endpoint:", BASE_URL);
    console.log("🔙 Return URL:", RETURN_URL);
    console.log("📩 Notification URL:", NOTIFICATION_URL);

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": APP_ID,
        "x-client-secret": SECRET_KEY,
      },
      body: JSON.stringify({
        order_id,
        order_amount,
        order_currency: "INR",
        customer_details: {
          customer_id: `user_${Math.random().toString(36).substring(7)}`,
          customer_name,
          customer_email,
          customer_phone,
        },
        order_meta: {
          return_url: `${RETURN_URL}?bookingId=${order_id}`,
          notify_url: NOTIFICATION_URL,
        },
      }),
    });

    const data = await response.json();
    console.log("🔍 Cashfree API Response:", data);

    if (!data || !data.payment_session_id) {
      console.error("❌ Cashfree API Error:", data);
      return NextResponse.json(
        { error: "Failed to generate payment session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ paymentSessionId: data.payment_session_id });
  } catch (error) {
    console.error("❌ Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
