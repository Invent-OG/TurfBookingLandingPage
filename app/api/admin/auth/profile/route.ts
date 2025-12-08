import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// GET: Fetch Admin Profile
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("adminId");

    if (!adminId) {
      return NextResponse.json({ error: "Admin ID required" }, { status: 400 });
    }

    const admin = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, adminId))
      .limit(1);

    if (!admin.length) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json(admin[0]);
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT: Update Admin Profile (Email/Password)
export async function PUT(req: Request) {
  try {
    const { adminId, email, currentPassword, newPassword } = await req.json();

    if (!adminId || !currentPassword) {
      return NextResponse.json(
        { error: "Admin ID and current password are required" },
        { status: 400 }
      );
    }

    // Fetch Admin
    const admin = await db
      .select()
      .from(users)
      .where(eq(users.id, adminId))
      .limit(1);

    if (!admin.length) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const adminUser = admin[0];

    // Verify Password
    const isMatch = await bcrypt.compare(currentPassword, adminUser.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Incorrect current password" },
        { status: 400 }
      );
    }

    const updates: any = {};

    // Update Email
    if (email && email !== adminUser.email) {
      // Check if email already exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
      updates.email = email;
    }

    // Update Password
    if (newPassword) {
      updates.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updates).length > 0) {
      await db.update(users).set(updates).where(eq(users.id, adminId));
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
