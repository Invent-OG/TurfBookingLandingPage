import { NextResponse } from "next/server";
import { eq } from "drizzle-orm"; // Import eq from drizzle-orm
import { db } from "@/db/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { adminId, currentPassword, newPassword } = await req.json();

    // Fetch the admin user from the database
    const admin = await db
      .select()
      .from(users)
      .where(eq(users.id, adminId)) // ✅ Correct Drizzle ORM syntax
      .limit(1); // Get only one record

    if (!admin.length) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    // Get the first user from the array
    const adminUser = admin[0];

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, adminUser.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Incorrect current password" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in DB
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, adminId));

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
