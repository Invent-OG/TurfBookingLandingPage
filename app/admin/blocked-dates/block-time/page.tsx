"use client";

import { useState, useEffect } from "react";
import { format, isBefore, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Trash } from "lucide-react";

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
  end_date?: string; // Support for blocking date ranges
  reason: string;
};

type Booking = {
  date: string;
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
  const isDateDisabled = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");

    return (
      isBefore(date, new Date()) || // Disable past dates
      blockedDates.some(
        (d) =>
          formattedDate === d.start_date || // Single blocked date
          (d.end_date &&
            formattedDate >= d.start_date &&
            formattedDate <= d.end_date) // Range blocked dates
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

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <h1 className="text-xl font-bold">Block Time Slots</h1>

      <Select onValueChange={setTurfId} disabled={loading}>
        <SelectTrigger>
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
        onSelect={(selectedDate) => setDate(selectedDate || null)}
        disabled={loading || !turfId || isDateDisabled}
      />

      <div className="grid grid-cols-4 gap-2">
        {slots.map(({ time, isBooked, isBlocked }) => (
          <Button
            key={time}
            variant={
              isBooked
                ? "destructive"
                : blockedSlots.includes(time)
                ? "secondary"
                : "outline"
            }
            onClick={() => !isBooked && toggleBlockSlot(time)}
            disabled={isBooked || isBlocked}
          >
            {formatSlotTime(time)}
          </Button>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!blockedSlots.length || loading || !turfId || !date}
      >
        {loading ? "loading..." : "Save Blocked Slots"}
      </Button>

      <h2 className="text-lg font-semibold mt-6">Blocked Time Slots</h2>
      <div className="grid grid-cols-4 gap-2">
        {blockedSlots.map((time) => (
          <Button
            key={time}
            variant="secondary"
            onClick={() => handleDelete(time)}
            disabled={loading}
          >
            {formatSlotTime(time)} <Trash size={16} color="red" />
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AdminBlockTime;
