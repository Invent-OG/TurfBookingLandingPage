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
        promoPopupImage: null,
        isPromoPopupActive: false,
        promoTitle: null,
        promoDescription: null,
        promoButtonText: null,
        promoButtonLink: null,
        isPromoButtonActive: false,
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
    const promoImageFile = formData.get("promoImage") as File | null;
    const isPromoPopupActiveStr = formData.get("isPromoPopupActive") as string;

    // Enhanced fields
    const promoTitle = formData.get("promoTitle") as string;
    const promoDescription = formData.get("promoDescription") as string;
    const promoButtonText = formData.get("promoButtonText") as string;
    const promoButtonLink = formData.get("promoButtonLink") as string;
    const isPromoButtonActiveStr = formData.get(
      "isPromoButtonActive"
    ) as string;

    // Parse booleans
    let isPromoPopupActive: boolean | undefined = undefined;
    if (isPromoPopupActiveStr !== null) {
      isPromoPopupActive = isPromoPopupActiveStr === "true";
    }

    let isPromoButtonActive: boolean | undefined = undefined;
    if (isPromoButtonActiveStr !== null) {
      isPromoButtonActive = isPromoButtonActiveStr === "true";
    }

    let logoUrl = undefined;
    let promoPopupImage = undefined;

    // Handle Logo Upload
    if (logoFile && logoFile.size > 0) {
      const timestamp = Date.now();
      const safeName = logoFile.name.replace(/[^a-zA-Z0-9.]/g, "");
      const filename = `company-branding/${timestamp}-${safeName}`;
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from("app-assets")
        .upload(filename, buffer, { contentType: logoFile.type, upsert: true });

      if (uploadError)
        throw new Error(`Logo upload failed: ${uploadError.message}`);
      const {
        data: { publicUrl },
      } = supabase.storage.from("app-assets").getPublicUrl(filename);
      logoUrl = publicUrl;
    }

    // Handle Promo Image Upload
    if (promoImageFile && promoImageFile.size > 0) {
      const timestamp = Date.now();
      const safeName = promoImageFile.name.replace(/[^a-zA-Z0-9.]/g, "");
      const filename = `promos/${timestamp}-${safeName}`;
      const buffer = Buffer.from(await promoImageFile.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from("app-assets")
        .upload(filename, buffer, {
          contentType: promoImageFile.type,
          upsert: true,
        });

      if (uploadError)
        throw new Error(`Promo image upload failed: ${uploadError.message}`);
      const {
        data: { publicUrl },
      } = supabase.storage.from("app-assets").getPublicUrl(filename);
      promoPopupImage = publicUrl;
    }

    // Check if settings exist
    const settings = await db.select().from(siteSettings).limit(1);

    if (settings.length === 0) {
      await db.insert(siteSettings).values({
        companyName: companyName || "TurfBook",
        supportEmail: supportEmail || "support@turfbook.com",
        supportPhone: supportPhone || "+91 88838 88025",
        logoUrl: logoUrl,
        promoPopupImage: promoPopupImage,
        isPromoPopupActive: isPromoPopupActive ?? false,
        promoTitle: promoTitle || null,
        promoDescription: promoDescription || null,
        promoButtonText: promoButtonText || null,
        promoButtonLink: promoButtonLink || null,
        isPromoButtonActive: isPromoButtonActive ?? false,
      });
    } else {
      await db
        .update(siteSettings)
        .set({
          companyName: companyName || settings[0].companyName,
          supportEmail: supportEmail || settings[0].supportEmail,
          supportPhone: supportPhone || settings[0].supportPhone,
          ...(logoUrl ? { logoUrl } : {}),
          ...(promoPopupImage ? { promoPopupImage } : {}),
          ...(isPromoPopupActive !== undefined ? { isPromoPopupActive } : {}),
          promoTitle: promoTitle || settings[0].promoTitle,
          promoDescription: promoDescription || settings[0].promoDescription,
          promoButtonText: promoButtonText || settings[0].promoButtonText,
          promoButtonLink: promoButtonLink || settings[0].promoButtonLink,
          ...(isPromoButtonActive !== undefined ? { isPromoButtonActive } : {}),
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
