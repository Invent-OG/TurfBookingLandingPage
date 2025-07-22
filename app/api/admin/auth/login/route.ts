import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400 }
      );
    }

    // Fetch user from the database
    const { data, error } = await supabase
      .from("users")
      .select("id, email, password, role")
      .eq("email", email)
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        { status: 401 }
      );
    }

    // Check if the user is an admin
    if (data.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Access denied. Not an admin." }),
        { status: 403 }
      );
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, data.password);
    if (!passwordMatch) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        { status: 401 }
      );
    }

    // Return success message
    return new Response(
      JSON.stringify({ message: "Login successful", adminId: data.id }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
    });
  }
}
