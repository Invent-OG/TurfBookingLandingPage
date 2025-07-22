"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { format, isBefore, isAfter } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, CircleX, X } from "lucide-react";
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
        .select("id, start_date, end_date, reason")
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
          formattedDate === d.start_date || // Disable single blocked dates
          (d.end_date &&
            formattedDate >= d.start_date &&
            formattedDate <= d.end_date) // Disable range of blocked dates
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

  return (
    <div className="p-6  space-y-6">
      <div className="flex items-center justify-between">
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
            <Button disabled={!selectedTurf}>Block a Date Range</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Block a Date Range</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Popover>
                <PopoverTrigger asChild className="flex items-center space-x-2">
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full flex justify-between items-center font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <CalendarIcon />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a dateRange</span>
                      )}
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="text"
                placeholder="Reason (Optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <Button onClick={createBlockedDate}>Confirm Block</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <table className="w-full text-left rounded-lg">
          <thead className="bg-gray-100 ">
            <tr>
              <th className="px-4 py-2">Start Date</th>
              <th className="px-4 py-2">End Date</th>
              <th className="px-4 py-2">Reason</th>
              <th className="border-b p-2">Action</th>
            </tr>
          </thead>
          {blockedDates.length > 0 ? (
            <tbody>
              {blockedDates
                .filter((d) => d.end_date)
                .map((blockedDate) => (
                  <tr key={blockedDate.id} className="">
                    <td className="border-b p-2">{blockedDate.start_date}</td>
                    <td className="border-b p-2">{blockedDate.end_date}</td>
                    <td className="border-b p-2">{blockedDate.reason}</td>
                    <td className="border-b p-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteBlockedDateRange(blockedDate.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td
                  colSpan={3}
                  className="border-b p-2 text-center text-gray-500"
                >
                  No blocked dates range found
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}
