"use client";
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import clsx from "clsx";
import { format, isBefore, parse } from "date-fns";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Clock, User } from "lucide-react";

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
  end_date?: string;
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
        .is("blocked_times", null);

      if (blockedError) {
        console.error("Failed to fetch blocked dates:", blockedError.message);
        toast.error("Failed to load blocked dates.");
        return;
      }

      setBlockedDates(blockedData || []);
    };

    fetchBlockedAndBookedDates();
  }, [turfId]);

  const isDateDisabled = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    const today = format(new Date(), "yyyy-MM-dd");

    return (
      (isBefore(date, new Date()) && formattedDate !== today) ||
      blockedDates.some(
        (d) =>
          formattedDate === d.start_date ||
          (d.end_date &&
            formattedDate >= d.start_date &&
            formattedDate <= d.end_date)
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

  const formatSlotTime = (time: string) => {
    const parsedTime = parse(time, "HH:mm:ss", new Date());
    return format(parsedTime, "hh:mm a");
  };

  const inputClasses =
    "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-turf-neon/50 focus:ring-1 focus:ring-turf-neon/20 rounded-xl";
  const labelClasses = "text-gray-300 font-medium mb-1.5 block";

  return (
    <div className="max-w-6xl mx-auto pb-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white font-heading tracking-wide">
          Create New Booking
        </h1>
        <p className="text-gray-400 mt-1">
          Book slots manually for walk-in customers or phone reservations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard title="Select Slot" className="overflow-visible">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label className={labelClasses}>Select Arena</Label>
                  <Select
                    onValueChange={setTurfId}
                    value={turfId}
                    disabled={loading}
                  >
                    <SelectTrigger className={inputClasses}>
                      <SelectValue placeholder="Choose an arena..." />
                    </SelectTrigger>
                    <SelectContent className="bg-turf-dark border-white/10 text-white">
                      {turfs.map((turf) => (
                        <SelectItem key={turf.id} value={turf.id}>
                          {turf.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className={labelClasses}>Select Date</Label>
                  {/* Custom styled wrapper for Calendar if needed, but default is okay for now */}
                  {/* We keep the calendar simple or wrap it */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex justify-center">
                    <Calendar
                      mode="single"
                      selected={date || undefined}
                      onSelect={(selectedDate) => {
                        if (selectedDate) {
                          setDate(selectedDate);
                          setStartTime("");
                        }
                      }}
                      disabled={loading || !turfId || isDateDisabled}
                      className="text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className={clsx(labelClasses, "mb-3")}>
                  Available Time Slots
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {loading ? (
                    <div className="col-span-full text-center py-8 text-gray-400">
                      Loading slots...
                    </div>
                  ) : availableSlots.length > 0 ? (
                    availableSlots.map(({ time, isBooked, isBlocked }) => (
                      <div
                        key={time}
                        onClick={() =>
                          !isBooked && !isBlocked && setStartTime(time)
                        }
                        className={clsx(
                          "p-2 text-center rounded-lg text-sm border font-medium transition-all cursor-pointer select-none",
                          isBooked
                            ? "bg-red-500/20 border-red-500/30 text-red-500 cursor-not-allowed"
                            : isBlocked
                              ? "bg-gray-500/20 border-gray-500/30 text-gray-400 cursor-not-allowed"
                              : startTime === time
                                ? "bg-turf-neon text-turf-dark border-turf-neon shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                                : "bg-white/5 border-white/10 text-gray-300 hover:border-turf-neon/50 hover:bg-white/10"
                        )}
                      >
                        {formatSlotTime(time)}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-400 border border-white/10 border-dashed rounded-xl">
                      {turfId
                        ? "No slots available for this date."
                        : "Select an arena to view slots."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div>
          <GlassCard title="Booking Details" className="sticky top-24">
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className={labelClasses}>Duration (Hours)</Label>
                <Input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className={inputClasses}
                  disabled={!turfId}
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-turf-neon" /> Customer Info
                </h4>
                <div className="space-y-3">
                  <Input
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={inputClasses}
                    disabled={!turfId}
                  />
                  <Input
                    placeholder="Phone Number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className={inputClasses}
                    disabled={!turfId}
                  />
                  <Input
                    placeholder="Email (Optional)"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className={inputClasses}
                    disabled={!turfId}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className={labelClasses}>Payment Method</Label>
                <Select
                  onValueChange={setPaymentMethod}
                  value={paymentMethod}
                  disabled={!turfId}
                >
                  <SelectTrigger className={inputClasses}>
                    <SelectValue placeholder="Select Payment Method" />
                  </SelectTrigger>
                  <SelectContent className="bg-turf-dark border-white/10 text-white">
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 mt-2 border-t border-white/10">
                <NeonButton
                  onClick={handleSubmit}
                  disabled={!turfId || !startTime || loading}
                  variant="primary"
                  glow
                  className="w-full h-12 text-lg"
                >
                  {loading ? "Processing..." : "Confirm Booking"}
                </NeonButton>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
