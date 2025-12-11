import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { turfPeakHours } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Remove id from body if present to avoid update error
    const { id: _, ...updateData } = body;

    const [updated] = await db
      .update(turfPeakHours)
      .set(updateData)
      .where(eq(turfPeakHours.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Peak hour not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating peak hour:", error);
    return NextResponse.json(
      { error: "Failed to update peak hour" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [deleted] = await db
      .delete(turfPeakHours)
      .where(eq(turfPeakHours.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Peak hour not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Peak hour deleted successfully" });
  } catch (error) {
    console.error("Error deleting peak hour:", error);
    return NextResponse.json(
      { error: "Failed to delete peak hour" },
      { status: 500 }
    );
  }
}
