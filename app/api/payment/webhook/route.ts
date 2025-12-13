// import { supabase } from "@/lib/supabase";
// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     console.log("✅ Webhook Received:", body);

//     // Extract necessary data
//     const orderId = body.data?.order?.order_id; // Matches `bookingId`
//     const paymentStatus = body.data?.payment?.payment_status; // SUCCESS / FAILED
//     const eventType = body.type; // Webhook event type

//     if (!orderId || !eventType) {
//       console.error("❌ Invalid webhook payload");
//       return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
//     }

//     if (eventType === "PAYMENT_SUCCESS_WEBHOOK") {
//       // ✅ Payment Successful → Update status to "booked"
//       const { error } = await supabase
//         .from("bookings")
//         .update({ status: "booked" })
//         .eq("id", orderId);

//       if (error) {
//         console.error("❌ Error updating booking:", error);
//         return NextResponse.json(
//           { error: "Database update failed" },
//           { status: 500 }
//         );
//       }

//       console.log(`✅ Booking ${orderId} updated to booked`);
//     } else if (
//       eventType === "PAYMENT_FAILED_WEBHOOK" ||
//       eventType === "PAYMENT_USER_DROPPED_WEBHOOK"
//     ) {
//       // ❌ Payment Failed / User Dropped → Remove Booking

//       const { error } = await supabase
//         .from("bookings")
//         .update({ status: "payment_failed" })
//         .eq("id", orderId);

//       if (error) {
//         console.error("❌ Error updating booking:", error);
//         return NextResponse.json(
//           { error: "Database update failed" },
//           { status: 500 }
//         );
//       }

//       // // Trigger deletion after 2 minutes

//       // const { error: deleteError } = await supabase
//       //   .from("bookings")
//       //   .delete()
//       //   .eq("id", orderId);

//       // if (deleteError) {
//       //   console.error("❌ Error deleting booking:", deleteError);
//       //   return NextResponse.json(
//       //     { error: "Failed to remove booking" },
//       //     { status: 500 }
//       //   );
//       // }

//       // console.log(`🗑️ Booking ${orderId} removed after failed payment`);

//       console.log(`🗑️ Booking ${orderId} removed due to failed payment`);
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("❌ Webhook Error:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("✅ Webhook Received:", body);

    const orderId = body.data?.order?.order_id; // bookingId
    const eventType = body.type; // Webhook event type

    if (!orderId || !eventType) {
      console.error("❌ Invalid webhook payload");
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (eventType === "PAYMENT_SUCCESS_WEBHOOK") {
      // ✅ Update booking status to "booked"
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: "booked" })
        .eq("id", orderId);

      if (updateError) {
        console.error("❌ Error updating booking:", updateError);
        return NextResponse.json(
          { error: "Database update failed" },
          { status: 500 }
        );
      }

      // ✅ Fetch full booking details to send confirmation email
      const { data: booking, error: fetchError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", orderId)
        .single();

      if (fetchError || !booking) {
        console.error("❌ Failed to fetch booking details:", fetchError);
        return NextResponse.json(
          { error: "Booking fetch failed" },
          { status: 500 }
        );
      }

      // ✅ Send confirmation email using internal email route
      const emailResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "booking_confirmation",
            email: booking.customerEmail,
            name: booking.customerName,
            turf: booking.turfName,
            date: booking.date,
            time: booking.startTime,
            duration: booking.duration,
            bookingId: booking.id,
            amount: booking.totalPrice,
            phone: booking.customerPhone,
          }),
        }
      );

      if (!emailResponse.ok) {
        const err = await emailResponse.json();
        console.error("📧 Email failed to send:", err);
      } else {
        console.log("📧 Booking confirmation email sent!");
      }

      console.log(`✅ Booking ${orderId} updated and email sent`);
    }

    // ❌ Handle failed / dropped payments
    else if (
      eventType === "PAYMENT_FAILED_WEBHOOK" ||
      eventType === "PAYMENT_USER_DROPPED_WEBHOOK"
    ) {
      const { error: failError } = await supabase
        .from("bookings")
        .update({ status: "payment_failed" })
        .eq("id", orderId);

      if (failError) {
        console.error("❌ Error updating booking:", failError);
        return NextResponse.json(
          { error: "Failed to update payment failure" },
          { status: 500 }
        );
      }

      // Fetch booking details for failure email
      const { data: booking } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", orderId)
        .single();

      if (booking) {
        // Send Failure Email
        await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/send-email`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "payment_failure",
              email: booking.customerEmail,
              name: booking.customerName,
              bookingId: booking.id,
              amount: booking.totalPrice,
              turf: booking.turfName,
            }),
          }
        ).catch((err) => console.error("Failed to send failure email", err));
      }

      console.log(`🛑 Booking ${orderId} marked as payment_failed`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
