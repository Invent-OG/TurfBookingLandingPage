import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const settings = await db.select().from(siteSettings).limit(1);

    // Return default if no settings exist
    if (settings.length === 0) {
      return NextResponse.json({
        companyName: "TurfBook",
        logoUrl: null,
        supportEmail: "support@turfbook.com",
        supportPhone: "+91 88838 88025",
      });
    }

    return NextResponse.json(settings[0]);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const companyName = formData.get("companyName") as string;
    const supportEmail = formData.get("supportEmail") as string;
    const supportPhone = formData.get("supportPhone") as string;
    const logoFile = formData.get("logo") as File | null;

    let logoUrl = undefined;

    // Handle File Upload to Supabase
    if (logoFile && logoFile.size > 0) {
      const timestamp = Date.now();
      const safeName = logoFile.name.replace(/[^a-zA-Z0-9.]/g, "");
      const filename = `company-branding/${timestamp}-${safeName}`;

      const buffer = Buffer.from(await logoFile.arrayBuffer());

      const { data, error: uploadError } = await supabase.storage
        .from("app-assets")
        .upload(filename, buffer, {
          contentType: logoFile.type,
          upsert: true,
        });

      if (uploadError) {
        console.error("Supabase Upload Error:", uploadError);
        throw new Error(`Failed to upload to Supabase: ${uploadError.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("app-assets").getPublicUrl(filename);

      logoUrl = publicUrl;
    }

    // Check if settings exist
    const settings = await db.select().from(siteSettings).limit(1);

    if (settings.length === 0) {
      // Create new
      await db.insert(siteSettings).values({
        companyName: companyName || "TurfBook",
        supportEmail: supportEmail || "support@turfbook.com",
        supportPhone: supportPhone || "+91 88838 88025",
        logoUrl: logoUrl,
      });
    } else {
      // Update existing
      await db
        .update(siteSettings)
        .set({
          companyName: companyName || settings[0].companyName,
          supportEmail: supportEmail || settings[0].supportEmail,
          supportPhone: supportPhone || settings[0].supportPhone,
          // Only update logo if a new one was provided, otherwise keep existing
          ...(logoUrl ? { logoUrl } : {}),
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.id, settings[0].id));
    }

    const updated = await db.select().from(siteSettings).limit(1);

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      {
        error: "Failed to update settings",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
