import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { bookings } from "@/db/schema";
import { desc, inArray } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.createdAt));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching admin bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid IDs provided" },
        { status: 400 }
      );
    }

    await db.delete(bookings).where(inArray(bookings.id, ids));

    return NextResponse.json({ message: "Bookings deleted successfully" });
  } catch (error) {
    console.error("Error deleting bookings:", error);
    return NextResponse.json(
      { error: "Failed to delete bookings" },
      { status: 500 }
    );
  }
}
