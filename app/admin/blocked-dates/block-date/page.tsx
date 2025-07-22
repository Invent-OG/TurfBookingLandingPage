"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

import { format, isBefore } from "date-fns";

type Turf = {
  id: string;
  name: string;
};

type BlockedDate = {
  id: string;
  start_date: string;
  end_date?: string; // Support for blocking date ranges
  reason: string;
  blocked_times: string[];
};

type Booking = {
  date: string;
};

export default function BlockDatePage() {
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [selectedTurf, setSelectedTurf] = useState<string | undefined>(
    undefined
  );
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchTurfs = async () => {
      const { data, error } = await supabase.from("turfs").select("id, name");
      if (error) {
        console.error("Failed to fetch turfs:", error.message);
        toast.error("Failed to load turfs.");
        return;
      }
      setTurfs(data || []);
    };

    fetchTurfs();
  }, []);

  useEffect(() => {
    if (!selectedTurf) return;

    const fetchBlockedAndBookedDates = async () => {
      const { data: blockedData, error: blockedError } = await supabase
        .from("blocked_dates")
        .select("id, start_date, end_date, reason, blocked_times") // Fetching both start_date & end_date
        .eq("turf_id", selectedTurf);

      const { data: bookedData, error: bookedError } = await supabase
        .from("bookings")
        .select("date")
        .eq("turf_id", selectedTurf);

      if (blockedError) {
        console.error("Failed to fetch blocked dates:", blockedError.message);
        toast.error("Failed to load blocked dates.");
        return;
      }

      if (bookedError) {
        console.error("Failed to fetch booked dates:", bookedError.message);
        toast.error("Failed to load booked dates.");
        return;
      }

      setBlockedDates(
        blockedData.map((d: any) => ({
          ...d,
          blocked_times: d.blocked_times || [],
        })) || []
      );
      setBookedDates(bookedData.map((b: Booking) => b.date));
    };

    fetchBlockedAndBookedDates();
  }, [selectedTurf]);

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
      ) ||
      bookedDates.includes(formattedDate) // Already booked dates
    );
  };

  const createBlockedDate = async () => {
    if (!selectedTurf || !date) {
      toast.error("Turf and Date are required!");
      return;
    }

    const formattedDate = format(date, "yyyy-MM-dd");
    if (blockedDates.some((d) => d.start_date === formattedDate)) {
      toast.error("This date is already blocked.");
      return;
    }

    const { data, error } = await supabase
      .from("blocked_dates")
      .insert([{ turf_id: selectedTurf, start_date: formattedDate, reason }])
      .select();

    if (error) {
      toast.error("Failed to block date.");
    } else {
      toast.success("Date blocked successfully!");
      setBlockedDates([
        ...blockedDates,
        {
          id: data ? data[0].id : "",
          start_date: formattedDate,
          reason,
          blocked_times: [],
        },
      ]);
      setDialogOpen(false);
      setDate(undefined);
      setReason("");
    }
  };

  const deleteBlockedDate = async (id: string) => {
    const { error } = await supabase
      .from("blocked_dates")
      .delete()
      .match({ id });
    if (error) {
      toast.error("Failed to delete blocked date.");
    } else {
      toast.success("Blocked date removed successfully.");
      setBlockedDates(blockedDates.filter((date) => date.id !== id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="w-1/4">
          <Select onValueChange={setSelectedTurf}>
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
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedTurf}>Block a Date</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Block a Date</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 flex flex-col justify-center items-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={isDateDisabled}
              />
              <Input
                type="text"
                placeholder="Reason (Optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <Button className="w-full" onClick={createBlockedDate}>
                Confirm Block
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <table className="w-full text-left rounded-lg">
          <thead className="bg-gray-100 ">
            <tr>
              <th className="border-b p-2">Date</th>
              <th className="border-b p-2">Reason</th>
              <th className="border-b p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {blockedDates.filter(
              (d) =>
                !d.end_date &&
                (!d.blocked_times || d.blocked_times.length === 0)
            ).length > 0 ? (
              blockedDates
                .filter(
                  (d) =>
                    !d.end_date &&
                    (!d.blocked_times || d.blocked_times.length === 0)
                )
                .map((blockedDate) => (
                  <tr key={blockedDate.id}>
                    <td className="border-b p-2">{blockedDate.start_date}</td>
                    <td className="border-b p-2">
                      {blockedDate.reason || "No reason provided"}
                    </td>
                    <td className="border-b p-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteBlockedDate(blockedDate.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="border-b p-2 text-center text-gray-500"
                >
                  No blocked dates found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
