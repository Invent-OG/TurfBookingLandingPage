import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { galleryImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { supabase } from "@/lib/supabase";

// POST: Upload Images (Multiple)
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    const uploadedImages = [];

    for (const file of files) {
      // Upload to Supabase
      const timestamp = Date.now();
      // Generate a refined safe name to prevent collisions for rapid uploads
      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "");
      const filename = `gallery/${timestamp}-${Math.random().toString(36).substring(7)}-${safeName}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from("app-assets")
        .upload(filename, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        console.error(`Failed to upload ${file.name}:`, uploadError.message);
        continue; // Skip failed uploads
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("app-assets").getPublicUrl(filename);

      // Save to DB
      const result = await db
        .insert(galleryImages)
        .values({
          imageUrl: publicUrl,
        })
        .returning();

      if (result && result[0]) {
        uploadedImages.push(result[0]);
      }
    }

    return NextResponse.json({
      message: `Successfully uploaded ${uploadedImages.length} images`,
      images: uploadedImages,
    });
  } catch (error: any) {
    console.error("Error uploading images:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload images" },
      { status: 500 }
    );
  }
}

// DELETE: Remove Image
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const imageUrl = searchParams.get("url"); // Optional, to delete from storage if needed

    if (!id) {
      return NextResponse.json({ error: "Image ID required" }, { status: 400 });
    }

    // Delete from DB
    await db.delete(galleryImages).where(eq(galleryImages.id, id));

    // Optional: Delete from Supabase Storage if you want strict cleanup
    // We can extract path from URL if needed, currently just DB delete for simplicity/speed
    // The bucket is public so orphaned files aren't a huge security risk, but good to clean up eventually.
    // implementing cleanup:
    if (imageUrl) {
      try {
        const path = imageUrl.split("/app-assets/")[1];
        if (path) {
          await supabase.storage.from("app-assets").remove([path]);
        }
      } catch (e) {
        console.error("Failed to delete from storage", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
