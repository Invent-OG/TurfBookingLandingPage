"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Success from "./components/Success";
import Failure from "./components/Failure";
import { supabase } from "@/lib/supabase";

type BookingData = {
  id: string;
  turf_name: string | null;
  date: string;
  start_time: string;
  duration: number;
  total_price: number;
  status: string;
};

function BookingStatusContent({ bookingId }: { bookingId: string | null }) {
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails(bookingId);
    } else {
      setIsLoading(false);
      setErrorMessage("Invalid booking ID.");
    }
  }, [bookingId]);

  async function fetchBookingDetails(bookingId: string) {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          "id, turf_name, date, start_time, duration, total_price, status"
        )
        .eq("id", bookingId)
        .single();

      if (error || !data) {
        console.error("❌ Error fetching booking details:", error);
        setErrorMessage("Booking not found.");
        setIsLoading(false);
        return;
      }

      console.log("✅ Fetched booking data:", data);

      // Check if turf_name is missing, fetch it from the turfs table if needed
      if (!data.turf_name) {
        const { data: turfData, error: turfError } = await supabase
          .from("turfs")
          .select("name")
          .eq("id", bookingId)
          .single();

        if (turfError || !turfData) {
          console.error("❌ Error fetching turf name:", turfError);
          setErrorMessage("Booking data incomplete (missing turf name).");
          setIsLoading(false);
          return;
        }

        data.turf_name = turfData.name;
      }

      setBookingData(data);
      setIsLoading(false);
    } catch (err) {
      console.error("❌ Unexpected error fetching booking:", err);
      setErrorMessage("An error occurred while fetching booking details.");
      setIsLoading(false);
    }
  }

  async function deleteBookingFromSupabase(orderId: string) {
    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", orderId);
      if (error) throw error;
      console.log(`🗑️ Booking ${orderId} removed after failed payment`);
    } catch (error) {
      console.error("❌ Error deleting booking:", error);
    }
  }

  useEffect(() => {
    if (bookingData && bookingData.status !== "booked" && bookingId) {
      deleteBookingFromSupabase(bookingId);
    }
  }, [bookingData, bookingId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-red-500 font-semibold">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-turf-dark flex items-center justify-center p-4">
      {bookingData ? (
        bookingData.status === "booked" ? (
          <div className="w-full max-w-md">
            <Success bookingData={bookingData} />
          </div>
        ) : (
          <div className="w-full max-w-md">
            <Failure bookingData={bookingData} />
          </div>
        )
      ) : (
        <div className="h-screen flex items-center justify-center text-white">
          <p className="text-red-500 font-semibold bg-white/5 px-6 py-3 rounded-xl border border-white/10">
            Booking not found.
          </p>
        </div>
      )}
    </div>
  );
}

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
