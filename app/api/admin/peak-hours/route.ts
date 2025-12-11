import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { turfPeakHours } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const turfId = searchParams.get("turfId");

    if (!turfId) {
      return NextResponse.json(
        { error: "Turf ID is required" },
        { status: 400 }
      );
    }

    const data = await db
      .select()
      .from(turfPeakHours)
      .where(eq(turfPeakHours.turfId, turfId));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching peak hours:", error);
    return NextResponse.json(
      { error: "Failed to fetch peak hours" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      turfId,
      type,
      daysOfWeek,
      specificDate,
      startTime,
      endTime,
      price,
    } = body;

    if (!turfId || !type || !startTime || !endTime || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [newEntry] = await db
      .insert(turfPeakHours)
      .values({
        turfId,
        type,
        daysOfWeek: daysOfWeek || null,
        specificDate: specificDate || null,
        startTime,
        endTime,
        price: String(price),
      })
      .returning();

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("Error creating peak hour:", error);
    return NextResponse.json(
      { error: "Failed to create peak hour" },
      { status: 500 }
    );
  }
}
