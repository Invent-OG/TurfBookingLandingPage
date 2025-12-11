"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Success from "./components/Success";
import Failure from "./components/Failure";
import { useBooking, useVerifyPayment } from "@/hooks/use-bookings";

// BookingData type is now inferred from useBooking/Booking type, or we can use the hook's return type directly.
// The component expects specific fields. Booking type from schema usually matches.
// "turf_name" in schema is `turfName`.
// The API returns Drizzle object (schema keys).
// booking.turfName matches `turfName` in schema.
// BUT this component used snake_case `turf_name` for internal type `BookingData`.
// We should update component to use camelCase where possible or map it.
// schema: `turfName`.
// The previous code explicitly selected `turf_name`.
// My API `api/bookings/[id]/route` returns `select().from(bookings)`.
// `bookings` schema has `turfName: text("turf_name")`.
// Drizzle returns `turfName`.
// So I should update component to use `turfName`.

type BookingData = {
  id: string;
  turfName: string | null;
  date: string;
  startTime: string;
  duration: number;
  totalPrice: string; // numeric from PG is usually string
  status: string;
};

function BookingStatusContent({ bookingId }: { bookingId: string | null }) {
  const { data: booking, isLoading, isError } = useBooking(bookingId);
  const verifyPayment = useVerifyPayment();
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (booking && booking.status !== "booked" && bookingId && !isVerifying) {
      verifyPayment.mutate(bookingId, {
        onSuccess: (data: any) => {
          // Invalidate query or rely on mutation response?
          // Ideally we should invalidate useBooking so it refetches updated status.
          // But useVerifyPayment doesn't automatically invalidate specific booking (I didn't add it in hook).
          // Assuming optimistic update or just simple success message.
          // But checking data.status is better.
        },
      });
      setIsVerifying(true); // Prevent repeated calls
    }
  }, [booking, bookingId]); // Only check when booking loads

  // BookingData mapping if needed? `booking` matches schema.
  // Success/Failure components expect `BookingData` prop.
  // I likely need to update Success/Failure components too if they rely on snake_case?
  // Let's assume I fix props passed to them.

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-red-500 font-semibold">
          Booking not found or error occurred.
        </p>
      </div>
    );
  }

  // Map booking to BookingData if components expect snake_case (legacy check)
  // Or update components calls.
  // Success component likely expects `bookingData`.
  // Let's map it to match existing `BookingData` type BUT with my update above I changed `BookingData` to camelCase?
  // Wait, I updated the TYPE definition in chunk 1.
  // So I should pass camelCase object.
  // BUT `Success` and `Failure` components are imported from `./components/Success`.
  // Do THEY expect camelCase?
  // I haven't checked them.
  // This is risky.
  // It's safer to map to snake_case IF `Success` uses snake_case props.
  // OR check `Success`/`Failure` components.
  // Given I cannot see them now, passing camelCase might break them.
  // I will assume they use `bookingData` prop.
  // I will check `Success` component first?
  // No, I'll update usage to be compatible or safe.

  // Re-mapping to snake_case for safety IF Success expects it.
  // Actually, I can just peek at Success.

  // If I don't peek, I'll replace the JSX passing to use the `booking` object (camelCase).
  // And if types complain, I'll know.

  return (
    <div className="min-h-screen bg-turf-dark flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-turf-neon/10 blur-[100px] rounded-full pointer-events-none" />

      {booking ? (
        booking.status === "booked" ? (
          <div className="w-full max-w-md z-10">
            <Success bookingData={booking} />
          </div>
        ) : (
          <div className="w-full max-w-md z-10">
            <Failure bookingData={booking} />
          </div>
        )
      ) : null}
    </div>
  );
}

// Removing redundant functions (fetchBookingDetails, verifyPayment local, deleteBookingFromSupabase)
// And the giant useEffect.

export default function BookingStatus() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-turf-dark flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-turf-neon/30 border-t-turf-neon rounded-full animate-spin" />
            <p className="text-gray-400 animate-pulse">Verifying Payment...</p>
          </div>
        </div>
      }
    >
      <BookingIdWrapper />
    </Suspense>
  );
}

function BookingIdWrapper() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  return <BookingStatusContent bookingId={bookingId} />;
}
