import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { galleryImages } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const images = await db
      .select()
      .from(galleryImages)
      .orderBy(desc(galleryImages.createdAt));

    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
