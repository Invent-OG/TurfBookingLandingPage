import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { turfs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Use Promise as per usage
) {
  try {
    const { id } = await params;
    const turf = await db.select().from(turfs).where(eq(turfs.id, id)).limit(1);

    if (turf.length === 0) {
      return NextResponse.json({ error: "Turf not found" }, { status: 404 });
    }

    return NextResponse.json(turf[0]);
  } catch (error) {
    console.error("Error fetching turf:", error);
    return NextResponse.json(
      { error: "Failed to fetch turf" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Remove id from body to avoid update error if present
    const { id: _, ...updateData } = body;

    const updatedTurf = await db
      .update(turfs)
      .set(updateData)
      .where(eq(turfs.id, id))
      .returning();

    if (updatedTurf.length === 0) {
      return NextResponse.json({ error: "Turf not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTurf[0]);
  } catch (error) {
    console.error("Error updating turf:", error);
    return NextResponse.json(
      { error: "Failed to update turf" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deletedTurf = await db
      .delete(turfs)
      .where(eq(turfs.id, id))
      .returning();

    if (deletedTurf.length === 0) {
      return NextResponse.json({ error: "Turf not found" }, { status: 404 });
    }

    return NextResponse.json(deletedTurf[0]);
  } catch (error) {
    console.error("Error deleting turf:", error);
    return NextResponse.json(
      { error: "Failed to delete turf" },
      { status: 500 }
    );
  }
}
