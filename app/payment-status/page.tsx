"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Success from "./components/Success";
import Failure from "./components/Failure";
import { useQueryClient } from "@tanstack/react-query";
import { useBooking, useVerifyPayment } from "@/hooks/use-bookings";

// Refactored Component
function BookingStatusContent({ bookingId }: { bookingId: string | null }) {
  const queryClient = useQueryClient();
  const { data: booking, isLoading, isError } = useBooking(bookingId);
  const verifyPayment = useVerifyPayment();
  const [hasAttemptedVerify, setHasAttemptedVerify] = useState(false);

  useEffect(() => {
    if (booking) {
      // Cast to string to avoid "no overlap" error if types are slightly mismatched
      if ((booking.status as string) === "confirmed") {
        setHasAttemptedVerify(true);
        return;
      }

      if (
        !hasAttemptedVerify &&
        bookingId &&
        !verifyPayment.isPending &&
        (booking.status as string) !== "confirmed" &&
        booking.status !== "expired" &&
        booking.status !== "cancelled"
      ) {
        verifyPayment.mutate(bookingId, {
          onSuccess: (data: any) => {
            if (data.status === "confirmed") {
              queryClient.setQueryData(["booking", bookingId], (old: any) => ({
                ...old,
                status: "confirmed",
              }));
            }
            queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
            setHasAttemptedVerify(true);
          },
          onError: () => {
            setHasAttemptedVerify(true);
          },
        });
      } else if (
        !hasAttemptedVerify &&
        (booking.status === "expired" || booking.status === "cancelled")
      ) {
        setHasAttemptedVerify(true);
      }
    }
  }, [booking, bookingId, hasAttemptedVerify, verifyPayment, queryClient]);

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

  // Show Success if confirmed
  if ((booking.status as string) === "confirmed") {
    return (
      <div className="min-h-screen bg-turf-dark flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-turf-neon/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="w-full max-w-md z-10">
          <Success bookingData={booking} />
        </div>
      </div>
    );
  }

  // Show Loading while verifying
  if (!hasAttemptedVerify || verifyPayment.isPending) {
    return (
      <div className="min-h-screen bg-turf-dark flex items-center justify-center p-4 relative overflow-hidden">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-turf-neon/30 border-t-turf-neon rounded-full animate-spin" />
          <p className="text-gray-400 animate-pulse">
            Verifying secure payment...
          </p>
        </div>
      </div>
    );
  }

  // Show Failure if verified and still not confirmed
  return (
    <div className="min-h-screen bg-turf-dark flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-turf-neon/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="w-full max-w-md z-10">
        <Failure bookingData={booking} />
      </div>
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
