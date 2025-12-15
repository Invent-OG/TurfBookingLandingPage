import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize Supabase Admin Client for server-side operations
// access to process.env is required. Ensure these env vars are set.
// Initialize Supabase Admin Client for server-side operations
// access to process.env is required. Ensure these env vars are set.
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  /*
    Support for both legacy 'service_role' keys and new 'sb_secret_...' keys.
    See: https://github.com/orgs/supabase/discussions/29260
  */
  const supabaseServiceKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  console.log("Debug: Checking Supabase Keys");
  console.log("NEXT_PUBLIC_SUPABASE_URL present:", !!supabaseUrl);
  console.log(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY present:",
    !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  );
  console.log(
    "SUPABASE_SECRET_KEY present:",
    !!process.env.SUPABASE_SECRET_KEY
  );
  console.log("Final Service Key present:", !!supabaseServiceKey);

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase credentials (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY or SUPABASE_SECRET_KEY)"
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string;
    const path = formData.get("path") as string; // Optional custom path

    if (!file || !bucket) {
      return NextResponse.json(
        { error: "Missing file or bucket" },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    const fileName = path || `${Date.now()}-${file.name.replace(/\s/g, "_")}`;

    const { data, error } = await getSupabaseAdmin()
      .storage.from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase Storage Upload Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const publicUrl = getSupabaseAdmin()
      .storage.from(bucket)
      .getPublicUrl(data.path).data.publicUrl;

    return NextResponse.json(
      {
        message: "File uploaded successfully",
        url: publicUrl,
        path: data.path,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Storage Upload API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { bucket, path } = await req.json();

    if (!bucket || !path) {
      return NextResponse.json(
        { error: "Missing bucket or path" },
        { status: 400 }
      );
    }

    // Extract file path from full URL if necessary
    // Example: https://xyz.supabase.co/storage/v1/object/public/turf-images/file.jpg
    // path should be "file.jpg" or "folder/file.jpg"
    // If the client sends full URL, we need to parse it.
    // Let's assume the client sends the relative path or we parse it here.

    let relativePath = path;
    if (path.startsWith("http")) {
      const urlParts = path.split(`${bucket}/`);
      if (urlParts.length > 1) {
        relativePath = urlParts[1];
      }
    }

    const { error } = await getSupabaseAdmin()
      .storage.from(bucket)
      .remove([relativePath]);

    if (error) {
      console.error("Supabase Storage Delete Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Storage API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
