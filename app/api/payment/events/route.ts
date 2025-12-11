import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      order_id,
      order_amount,
      customer_email,
      customer_phone,
      customer_name,
    } = await req.json();

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

    // Use a specific return URL for Events
    // Assuming the base domain is handled or relative paths work if configured correctly in Cashfree,
    // but typically Cashfree requires absolute URLs.
    // The existing generic route uses process.env.CASHFREE_RETURN_URL.
    // I should check if I can construct the URL based on the request origin or use a new env var.
    // For now, I'll rely on a new constructed URL or fallback to the generic one IF it can navigate to the right place.
    // Existing generic: `${RETURN_URL}?bookingId=${order_id}`
    // If RETURN_URL is `https://.../payment-status`, then I can't easily change it without changing env.
    // But I can override it here if I know the domain.
    // I will use req.headers.get("origin") to build the return URL dynamically if possible.

    const origin =
      req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "";
    const RETURN_URL = `${origin}/events/payment-status?registrationId=${order_id}`;

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
          return_url: RETURN_URL,
        },
      }),
    });

    const data = await response.json();

    if (!data || !data.payment_session_id) {
      console.error("Cashfree Error", data);
      return NextResponse.json(
        { error: "Failed to generate payment session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ paymentSessionId: data.payment_session_id });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
