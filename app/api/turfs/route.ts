import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { turfs } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allTurfs = await db
      .select()
      .from(turfs)
      .orderBy(desc(turfs.createdAt));
    return NextResponse.json(allTurfs);
  } catch (error) {
    console.error("Error fetching turfs:", error);
    return NextResponse.json(
      { error: "Failed to fetch turfs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newTurf = await db.insert(turfs).values(body).returning();
    return NextResponse.json(newTurf[0]);
  } catch (error) {
    console.error("Error creating turf:", error);
    return NextResponse.json(
      { error: "Failed to create turf" },
      { status: 500 }
    );
  }
}
