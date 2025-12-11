import { db } from "@/db/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return new Response(JSON.stringify({ error: "Booking ID is required" }), {
        status: 400,
      });
    }

    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (booking.length === 0) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(booking[0]), { status: 200 });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch booking details" }),
      { status: 500 }
    );
  }
}
