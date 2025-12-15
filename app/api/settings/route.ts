import { db } from "@/db/db";
import { siteSettings } from "@/db/schema";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await db.select().from(siteSettings).limit(1);

    // Return default object if no settings found, or the first row
    const data = settings[0] || {
      companyName: "TurfBook",
      logoUrl: null,
      supportEmail: null,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
