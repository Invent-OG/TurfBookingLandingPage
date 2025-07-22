import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🟢 Received Booking Payload:", body);

    const {
      userId, // Nullable for walk-ins
      turfId,
      turf_name, // 🔥 Fixed: Match frontend key
      date,
      startTime,
      duration,
      totalPrice,
      status = "booked", // Default to "booked"
      paymentMethod,
      customerName,
      customerPhone,
      customerEmail,
      createdBy,
    } = body;

    // 🔍 Extra Debugging for Missing Fields
    if (!turfId) console.error("❌ Missing turfId");
    if (!turf_name) console.error("❌ Missing turf_name"); // 🔥 Fixed key
    if (!date) console.error("❌ Missing date");
    if (!startTime) console.error("❌ Missing startTime");
    if (!customerName) console.error("❌ Missing customerName");
    if (!customerPhone) console.error("❌ Missing customerPhone");

    if (
      !turfId ||
      !turf_name ||
      !date ||
      !startTime ||
      !customerName ||
      !customerPhone
    ) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          receivedData: body,
        }),
        { status: 400 }
      );
    }

    // ✅ Ensure `duration` and `totalPrice` are numbers
    const parsedDuration = Number(duration);
    const parsedTotalPrice = Number(totalPrice);
    if (isNaN(parsedDuration) || isNaN(parsedTotalPrice)) {
      console.error(
        "❌ Invalid Duration or Total Price:",
        duration,
        totalPrice
      );
      return new Response(
        JSON.stringify({ error: "Invalid duration or total price" }),
        {
          status: 400,
        }
      );
    }

    // ✅ Insert booking into Supabase
    const { data, error } = await supabase.from("bookings").insert([
      {
        user_id: userId, // Can be null for walk-ins
        turf_id: turfId,
        turf_name, // 🔥 Fixed: Use the correct variable name
        date,
        start_time: startTime,
        duration: parsedDuration,
        total_price: parsedTotalPrice,
        status, // Default to "booked"
        payment_method: paymentMethod,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        created_by: createdBy,
        created_at: new Date().toISOString(), // Auto-set timestamp
      },
    ]);

    if (error) {
      console.error("❌ Supabase Error:", error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ success: true, booking: data }), {
      status: 200,
    });
  } catch (error) {
    console.error("❌ Booking error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
