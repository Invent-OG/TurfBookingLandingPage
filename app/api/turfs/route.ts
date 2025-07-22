import { NextResponse } from "next/server";
import { turfs } from "@/db/schema";
import { db } from "@/db/db";

export async function GET() {
  try {
    const allTurfs = await db.select().from(turfs);
    return NextResponse.json(allTurfs, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch turfs" },
      { status: 500 }
    );
  }
}
