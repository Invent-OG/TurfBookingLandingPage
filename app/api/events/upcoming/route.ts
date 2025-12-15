import { db } from "@/db/db";
import { events } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const upcomingEvents = await db
      .select()
      .from(events)
      .where(eq(events.status, "upcoming"))
      .orderBy(desc(events.startDate))
      .limit(1);

    if (!upcomingEvents.length) {
      return NextResponse.json(null);
    }

    return NextResponse.json(upcomingEvents[0]);
  } catch (error) {
    console.error("Error fetching upcoming event:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
