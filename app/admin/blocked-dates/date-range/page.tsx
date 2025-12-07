"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { format, isBefore, isAfter } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Trash2, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

type Turf = {
  id: string;
  name: string;
};

type BlockedDate = {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
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
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
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
        .select("id, start_date, end_date, reason")
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

      setBlockedDates(blockedData || []);
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
    if (!selectedTurf || !dateRange.from || !dateRange.to) {
      toast.error("Turf, Start Date, and End Date are required!");
      return;
    }

    if (isAfter(dateRange.from, dateRange.to)) {
      toast.error("End date must be after start date.");
      return;
    }

    const formattedStartDate = format(dateRange.from, "yyyy-MM-dd");
    const formattedEndDate = format(dateRange.to, "yyyy-MM-dd");

    const { data, error } = await supabase
      .from("blocked_dates")
      .insert([
        {
          turf_id: selectedTurf,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          reason,
        },
      ])
      .select("id");

    if (error) {
      toast.error("Failed to block date range.");
    } else {
      toast.success("Date range blocked successfully!");
      setBlockedDates([
        ...blockedDates,
        {
          id: data ? data[0].id : "",
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          reason,
        },
      ]);
      setDialogOpen(false);
      setDateRange({ from: undefined, to: undefined });
      setReason("");
    }
  };

  const deleteBlockedDateRange = async (id: string) => {
    const { error } = await supabase
      .from("blocked_dates")
      .delete()
      .match({ id });
    if (error) {
      toast.error("Failed to delete blocked date range.");
    } else {
      toast.success("Blocked date range removed successfully.");
      setBlockedDates(blockedDates.filter((date) => date.id !== id));
    }
  };

  const inputClasses =
    "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-turf-neon/50 focus:ring-1 focus:ring-turf-neon/20 rounded-xl";
  const labelClasses = "text-gray-300 font-medium mb-1.5 block";

  return (
    <div className="max-w-5xl mx-auto pb-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white font-heading tracking-wide">
          Block Multiple Dates
        </h1>
        <p className="text-gray-400 mt-1">
          Prevent bookings for a continuous range of dates.
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
                <Ban className="w-4 h-4 mr-2" /> Block Range
              </NeonButton>
            </DialogTrigger>
            <DialogContent className="bg-turf-dark border border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Block Date Range</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-1">
                  <Label>Select Range</Label>
                  <Popover>
                    <PopoverTrigger
                      asChild
                      className="flex items-center space-x-2"
                    >
                      <NeonButton
                        id="date"
                        variant="secondary"
                        className={cn(
                          "w-full flex justify-between items-center font-normal px-4 py-2 border-white/10 bg-white/5 text-left",
                          !dateRange && "text-gray-500"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4 text-turf-neon" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "MMM dd, y")} -{" "}
                                {format(dateRange.to, "MMM dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "MMM dd, y")
                            )
                          ) : (
                            <span className="text-gray-400">
                              Pick a date range
                            </span>
                          )}
                        </div>
                      </NeonButton>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-turf-dark border border-white/10"
                      align="start"
                    >
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={(range) =>
                          setDateRange({
                            from: range?.from,
                            to: range?.to || undefined,
                          })
                        }
                        numberOfMonths={2}
                        disabled={isDateDisabled}
                        className="bg-turf-dark text-white rounded-xl"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1">
                  <Label>Reason (Optional)</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Field Renovation"
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
                  Confirm Block Range
                </NeonButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Start Date</th>
                <th className="px-6 py-4">End Date</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {blockedDates.length > 0 ? (
                blockedDates
                  .filter((d) => d.end_date)
                  .map((blockedDate) => (
                    <tr
                      key={blockedDate.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-white font-medium">
                        {format(
                          new Date(blockedDate.start_date),
                          "MMM d, yyyy"
                        )}
                      </td>
                      <td className="px-6 py-4 text-white font-medium">
                        {format(new Date(blockedDate.end_date), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {blockedDate.reason}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <NeonButton
                          size="sm"
                          variant="danger"
                          onClick={() => deleteBlockedDateRange(blockedDate.id)}
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
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500 bg-white/5"
                  >
                    No blocked date ranges found for this arena.
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
