"use client";

import { useState, useEffect } from "react";
import { format, isBefore, parse } from "date-fns";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Trash, CheckCircle, XCircle } from "lucide-react";
import clsx from "clsx";

interface Turf {
  id: string;
  name: string;
}

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

const AdminBlockTime = () => {
  const [turfId, setTurfId] = useState<string>("");
  const [date, setDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);

  useEffect(() => {
    const fetchTurfs = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("turfs").select("id, name");
      if (error) {
        toast.error("Failed to load turfs.");
      } else {
        setTurfs(data || []);
      }
      setLoading(false);
    };
    fetchTurfs();
  }, []);

  useEffect(() => {
    if (!turfId || !date) return;
    const fetchSlotsAndBlockedTimes = async () => {
      setLoading(true);
      const formattedDate = format(date, "yyyy-MM-dd");
      const now = new Date();
      const localTime = now.toTimeString().split(" ")[0];
      try {
        const [slotsRes, blockedRes] = await Promise.all([
          fetch(
            `/api/bookings/slots?turfId=${turfId}&date=${formattedDate}&localTime=${localTime}`
          ),
          fetch(`/api/block-time?turfId=${turfId}&date=${formattedDate}`),
        ]);
        const slotsData = await slotsRes.json();
        const blockedData = await blockedRes.json();

        setSlots(slotsData.availableSlots || []);
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

    return (
      isBefore(date, new Date()) ||
      blockedDates.some(
        (d) =>
          formattedDate === d.start_date ||
          (d.end_date &&
            formattedDate >= d.start_date &&
            formattedDate <= d.end_date)
      )
    );
  };

  const toggleBlockSlot = (time: string) => {
    setBlockedSlots((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const handleSubmit = async () => {
    if (!turfId || !date) return;
    setLoading(true);
    const formattedDate = format(date, "yyyy-MM-dd");
    try {
      const response = await fetch("/api/block-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turfId,
          date: formattedDate,
          blockedTimes: blockedSlots,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("Blocked times updated successfully");
      } else {
        toast.error(result?.message || "Failed to update blocked times");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
    setLoading(false);
  };

  const handleDelete = async (time: string) => {
    if (!turfId || !date) return;
    setLoading(true);
    const formattedDate = format(date, "yyyy-MM-dd");
    try {
      const response = await fetch("/api/block-time", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turfId, date: formattedDate, time }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("Blocked time removed successfully");
        setBlockedSlots((prev) => prev.filter((t) => t !== time));
      } else {
        toast.error(result?.message || "Failed to remove blocked time");
      }
    } catch (error) {
      toast.error("Something went wrong!");
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
    <div className="max-w-5xl mx-auto pb-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white font-heading tracking-wide">
          Block Time Slots
        </h1>
        <p className="text-gray-400 mt-1">
          Block specific time slots for selected dates to prevent bookings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <GlassCard title="Select Date & Arena">
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className={labelClasses}>Select Arena</Label>
                <Select onValueChange={setTurfId} disabled={loading}>
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
                <Label className={labelClasses}>Pick a Date</Label>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date || undefined}
                    onSelect={(selectedDate) => setDate(selectedDate || null)}
                    disabled={loading || !turfId || isDateDisabled}
                    className="text-white"
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <GlassCard title="Manage Slots">
            <div className="space-y-6">
              <div>
                <Label className={clsx(labelClasses, "mb-3")}>
                  Available Slots (Tap to Block/Unblock)
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {loading && !slots.length ? (
                    <div className="col-span-full text-center py-12 text-gray-400">
                      Loading available slots...
                    </div>
                  ) : slots.length > 0 ? (
                    slots.map(({ time, isBooked, isBlocked }) => (
                      <div
                        key={time}
                        onClick={() => !isBooked && toggleBlockSlot(time)}
                        className={clsx(
                          "p-3 text-center rounded-lg text-sm border font-medium transition-all cursor-pointer select-none relative overflow-hidden",
                          isBooked
                            ? "bg-red-500/10 border-red-500/20 text-red-500 opacity-60 cursor-not-allowed"
                            : blockedSlots.includes(time)
                              ? "bg-turf-neon/20 border-turf-neon text-turf-neon"
                              : "bg-white/5 border-white/10 text-gray-300 hover:border-turf-neon/50 hover:bg-white/10"
                        )}
                      >
                        {formatSlotTime(time)}
                        {blockedSlots.includes(time) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                            <CheckCircle className="w-5 h-5 text-turf-neon" />
                          </div>
                        )}
                        {isBooked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <XCircle className="w-4 h-4 text-red-500" />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 text-gray-400 border border-white/10 border-dashed rounded-xl">
                      {turfId && date
                        ? "No slots available for this date."
                        : "Select an arena and date to view slots."}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <NeonButton
                  onClick={handleSubmit}
                  disabled={!blockedSlots.length && !slots.length}
                  variant="primary"
                  glow
                  className="w-full md:w-auto"
                >
                  {loading ? "Saving Changes..." : "Save Blocked Slots"}
                </NeonButton>
              </div>
            </div>
          </GlassCard>

          {blockedSlots.length > 0 && (
            <GlassCard title="Blocked Slots Summary">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {blockedSlots.map((time) => (
                  <div
                    key={time}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm"
                  >
                    {formatSlotTime(time)}
                    <button
                      onClick={() => handleDelete(time)}
                      className="p-1 hover:bg-red-500/20 hover:text-red-500 rounded-md transition-colors"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBlockTime;
