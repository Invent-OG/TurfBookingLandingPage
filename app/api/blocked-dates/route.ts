import { blockedDates, bookings } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/db";

// Schema Validation
const BlockedDateSchema = z.object({
  turfId: z.string().uuid(),
  startDate: z.string().nonempty(),
  endDate: z.string().optional(),
  blockedTimes: z.array(z.string()).optional(),
  reason: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const turfId = searchParams.get("turfId");

    if (!turfId) {
      return NextResponse.json(
        { error: "Missing turfId parameter" },
        { status: 400 }
      );
    }

    const data = await db
      .select()
      .from(blockedDates)
      .where(eq(blockedDates.turfId, turfId));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching blocked dates:", error);
    return NextResponse.json(
      { error: "Failed to fetch blocked dates" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const parsedData = BlockedDateSchema.parse(data);
    const { turfId, startDate, endDate, blockedTimes, reason } = parsedData;

    // Check if there are existing bookings on this date (simple check on startDate)
    // For date ranges, we might need a more complex check, but start with this.
    const existingBookings = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.turfId, turfId), eq(bookings.date, startDate)));

    if (existingBookings.length > 0) {
      return NextResponse.json(
        { message: "Booking already exists for the selected date." },
        { status: 400 }
      );
    }

    // Insert Blocked Date
    const [insertedBlockedDate] = await db
      .insert(blockedDates)
      .values({
        turfId,
        startDate,
        endDate: endDate || null,
        blockedTimes: blockedTimes || null,
        reason,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Blocked date created successfully.",
        data: insertedBlockedDate,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating blocked date:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create blocked date.",
      },
      { status: 500 }
    );
  }
}
