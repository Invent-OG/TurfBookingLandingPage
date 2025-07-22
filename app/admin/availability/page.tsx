"use client";
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import clsx from "clsx";
import { format, isBefore, parse } from "date-fns";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const formatDate = (date: Date | undefined): string => {
  if (!date || isNaN(date.getTime())) {
    console.error("❌ Invalid date:", date);
    return "";
  }
  return format(date, "yyyy-MM-dd");
};

interface Slot {
  time: string;
  isBooked: boolean;
  isBlocked?: boolean;
}

type BlockedDate = {
  id: string;
  start_date: string;
  end_date?: string; // Support for blocking date ranges
  reason: string;
};

export default function ManualBookingForm() {
  const [date, setDate] = useState<Date>(new Date());
  const [turfId, setTurfId] = useState("");
  const [turfs, setTurfs] = useState<
    { id: string; name: string; pricePerHour: string }[]
  >([]);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const adminId = localStorage.getItem("adminId");

  // Fetch Turfs
  useEffect(() => {
    async function fetchTurfs() {
      try {
        const response = await fetch("/api/turfs");
        const data = await response.json();
        if (response.ok) {
          setTurfs(data);
        } else {
          toast.error("Error fetching turfs");
        }
      } catch (error) {
        toast.error("Server error while fetching turfs");
      }
    }
    fetchTurfs();
  }, []);

  console.log(turfs.find((turf) => turf.id === turfId)?.pricePerHour);

  // Fetch Available Slots when Turf or Date changes
  useEffect(() => {
    if (!turfId || !date) return;
    const fetchSlotsAndBlockedTimes = async () => {
      setLoading(true);
      const formattedDate = format(date, "yyyy-MM-dd");
      const now = new Date();
      const localTime = now.toTimeString().split(" ")[0]; // Get HH:mm:ss format
      try {
        const [slotsRes, blockedRes] = await Promise.all([
          fetch(
            `/api/bookings/slots?turfId=${turfId}&date=${formattedDate}&localTime=${localTime}`
          ),
          fetch(`/api/block-time?turfId=${turfId}&date=${formattedDate}`),
        ]);
        const slotsData = await slotsRes.json();
        const blockedData = await blockedRes.json();

        setAvailableSlots(slotsData.availableSlots || []);
        setBlockedSlots(blockedData.blockedTimes || []);
      } catch (error) {
        toast.error("Error fetching data.");
      }
      setLoading(false);
    };
    fetchSlotsAndBlockedTimes();
  }, [turfId, date]);

  useEffect(() => {
    if (!turfId) return;

    const fetchBlockedAndBookedDates = async () => {
      const { data: blockedData, error: blockedError } = await supabase
        .from("blocked_dates")
        .select("id, start_date, end_date, reason")
        .eq("turf_id", turfId)
        .is("blocked_times", null); // ✅ Fetch only dates with no blocked times

      if (blockedError) {
        console.error("Failed to fetch blocked dates:", blockedError.message);
        toast.error("Failed to load blocked dates.");
        return;
      }

      setBlockedDates(blockedData || []);
    };

    fetchBlockedAndBookedDates();
  }, [turfId]);

  // ✅ Updated to handle both single blocked dates and blocked ranges
  // const isDateDisabled = (date: Date) => {
  //   const formattedDate = format(date, "yyyy-MM-dd");

  //   return (
  //     isBefore(date, new Date()) || // Disable past dates
  //     blockedDates.some(
  //       (d) =>
  //         formattedDate === d.start_date || // Single blocked date
  //         (d.end_date &&
  //           formattedDate >= d.start_date &&
  //           formattedDate <= d.end_date) // Range blocked dates
  //     )
  //   );
  // };
  const isDateDisabled = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    const today = format(new Date(), "yyyy-MM-dd");

    return (
      (isBefore(date, new Date()) && formattedDate !== today) || // Allow today but disable past dates
      blockedDates.some(
        (d) =>
          formattedDate === d.start_date || // Single blocked date
          (d.end_date &&
            formattedDate >= d.start_date &&
            formattedDate <= d.end_date) // Range blocked dates
      )
    );
  };

  const handleSubmit = async () => {
    if (
      !turfId ||
      !date ||
      !startTime ||
      !customerName ||
      !customerPhone ||
      !duration
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    const formattedDate = formatDate(date);

    const pricePerHour = Number(
      turfs.find((turf) => turf.id === turfId)?.pricePerHour
    );
    const totalPrice = pricePerHour * duration;

    console.log(" Submitting Booking:", {
      turfId,
      date: formattedDate,
      startTime,
      duration,
      customerName,
      customerPhone,
      customerEmail,
      paymentMethod,
    });

    setLoading(true);
    try {
      const response = await fetch("/api/bookings/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turfId,
          turf_name: turfs.find((turf) => turf.id === turfId)?.name,
          date: formattedDate,
          startTime,
          duration: Number(duration),
          totalPrice: totalPrice,
          paymentMethod,
          customerName,
          customerPhone,
          customerEmail,
          createdBy: adminId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Booking successful", {
          description: "Manual booking has been added.",
        });
        // Reset form
        setStartTime("");
        setDuration(1);
        setCustomerName("");
        setCustomerPhone("");
        setCustomerEmail("");
        setPaymentMethod("cash");

        router.push("/admin/bookings");
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("❌ Server Error:", error);
      toast.error("Server error while submitting booking");
    }
    setLoading(false);
  };

  // Function to format slot time properly
  const formatSlotTime = (time: string) => {
    const parsedTime = parse(time, "HH:mm:ss", new Date());
    return format(parsedTime, "hh:mm a"); // Converts to 12-hour format with AM/PM
  };

  return (
    <div className="p-6 space-y-6 bg-white rounded-lg shadow-lg max-w-xl mx-auto w-full">
      <h2 className="text-xl font-semibold">Manual Booking</h2>

      <Select onValueChange={setTurfId} value={turfId} disabled={loading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Turf" />
        </SelectTrigger>
        <SelectContent>
          {turfs.map((turf) => (
            <SelectItem key={turf.id} value={turf.id}>
              {turf.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Calendar
        mode="single"
        selected={date || undefined}
        onSelect={(selectedDate) => {
          console.log("🟢 Date selected:", selectedDate);
          setStartTime("");
          console.log(formatDate(selectedDate), "format date");
          if (selectedDate) setDate(selectedDate);
        }}
        disabled={loading || !turfId || isDateDisabled}
        className="rounded-md border w-full"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {loading ? (
          <p>Loading slots...</p>
        ) : availableSlots.length > 0 ? (
          availableSlots.map(({ time, isBooked, isBlocked }) => (
            <Card
              key={time}
              className={clsx(
                "p-3 text-center cursor-pointer",
                isBooked
                  ? "bg-red-500 text-white cursor-not-allowed"
                  : isBlocked
                    ? "bg-gray-500 text-white cursor-not-allowed"
                    : startTime === time
                      ? "bg-black text-white"
                      : "bg-gray-100 hover:bg-gray-200"
              )}
              onClick={() => !isBooked && !isBlocked && setStartTime(time)}
              aria-disabled={isBooked || isBlocked}
            >
              {formatSlotTime(time)}
            </Card>
          ))
        ) : (
          <p>No slots available.</p>
        )}
      </div>

      <Input
        type="number"
        min="1"
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
        className="w-full"
        disabled={!turfId}
      />

      <Input
        placeholder="Customer Name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        className="w-full"
        disabled={!turfId}
      />
      <Input
        placeholder="Phone"
        value={customerPhone}
        onChange={(e) => setCustomerPhone(e.target.value)}
        className="w-full"
        disabled={!turfId}
      />
      <Input
        placeholder="Email"
        value={customerEmail}
        onChange={(e) => setCustomerEmail(e.target.value)}
        className="w-full"
        disabled={!turfId}
      />

      <Select
        onValueChange={setPaymentMethod}
        value={paymentMethod}
        disabled={!turfId}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Payment Method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="cash">Cash</SelectItem>
          <SelectItem value="upi">UPI</SelectItem>
          <SelectItem value="card">Card</SelectItem>
        </SelectContent>
      </Select>

      <Button
        onClick={handleSubmit}
        disabled={!turfId || !startTime || loading}
        className="w-full"
      >
        {loading ? "Processing..." : "Confirm Booking"}
      </Button>
    </div>
  );
}
