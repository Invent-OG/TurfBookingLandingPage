import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { bookings, turfs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Fetch bookings for the specific email, including turf details (implicitly via turfName)
    const userBookings = await db
      .select({
        id: bookings.id,
        turfName: bookings.turfName,
        date: bookings.date,
        startTime: bookings.startTime,
        duration: bookings.duration,
        totalPrice: bookings.totalPrice,
        status: bookings.status,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .where(eq(bookings.customerEmail, email))
      .orderBy(desc(bookings.date), desc(bookings.startTime));

    return NextResponse.json({ bookings: userBookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch user bookings" },
      { status: 500 }
    );
  }
}
