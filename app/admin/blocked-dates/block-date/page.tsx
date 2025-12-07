"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { format, isBefore } from "date-fns";
import { Ban, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";

type Turf = {
  id: string;
  name: string;
};

type BlockedDate = {
  id: string;
  start_date: string;
  end_date?: string;
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
        .select("id, start_date, end_date, reason, blocked_times")
        .eq("turf_id", selectedTurf);

      const { data: bookedData, error: bookedError } = await supabase
        .from("bookings")
        .select("date")
        .eq("turf_id", selectedTurf);

      if (blockedError) {
        toast.error("Failed to load blocked dates.");
        return;
      }

      if (bookedError) {
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
      ) ||
      bookedDates.includes(formattedDate)
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

  const inputClasses =
    "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-turf-neon/50 focus:ring-1 focus:ring-turf-neon/20 rounded-xl";
  const labelClasses = "text-gray-300 font-medium mb-1.5 block";

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white font-heading tracking-wide">
          Block Specific Date
        </h1>
        <p className="text-gray-400 mt-1">
          Prevent bookings on specific single dates for maintenance or holidays.
        </p>
      </div>

      <GlassCard className="overflow-visible">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex-1 w-full md:w-auto space-y-2">
            <Label className={labelClasses}>Select Arena</Label>
            <Select value={selectedTurf} onValueChange={setSelectedTurf}>
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

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <NeonButton
                disabled={!selectedTurf}
                variant="primary"
                glow
                className="mt-6 md:mt-2"
              >
                <Ban className="w-4 h-4 mr-2" /> Block a Date
              </NeonButton>
            </DialogTrigger>
            <DialogContent className="bg-turf-dark border border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Block Date Reference</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 flex flex-col justify-center items-center py-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={isDateDisabled}
                    className="text-white"
                  />
                </div>
                <div className="w-full space-y-1">
                  <Label>Reason (Optional)</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Maintenance"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className={inputClasses}
                  />
                </div>
              </div>
              <DialogFooter>
                <NeonButton
                  className="w-full"
                  variant="primary"
                  glow
                  onClick={createBlockedDate}
                >
                  Confirm Block
                </NeonButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
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
                    <tr
                      key={blockedDate.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-white font-medium flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-turf-neon" />
                        {format(
                          new Date(blockedDate.start_date),
                          "MMM d, yyyy"
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {blockedDate.reason || "No reason provided"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <NeonButton
                          size="sm"
                          variant="danger"
                          onClick={() => deleteBlockedDate(blockedDate.id)}
                          className="h-8 px-3"
                        >
                          <Trash2 className="w-4 h-4" />
                        </NeonButton>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-12 text-center text-gray-500 bg-white/5"
                  >
                    No blocked dates found for this arena.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
