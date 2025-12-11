"use client";

import { useState } from "react";
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
import { Trash, CheckCircle, XCircle } from "lucide-react";
import clsx from "clsx";
import { useTurfs } from "@/hooks/use-turfs";
import { useBlockedDates } from "@/hooks/use-blocked-dates";
import {
  useSlots,
  useBlockedTimes,
  useBlockTimeMutation,
  useUnblockTimeMutation,
} from "@/hooks/use-slots";

const AdminBlockTime = () => {
  const [turfId, setTurfId] = useState<string>("");
  const [date, setDate] = useState<Date | null>(null);
  const [pendingBlockedSlots, setPendingBlockedSlots] = useState<string[]>([]);

  const { data: turfs = [] } = useTurfs();
  const { data: availableSlots = [], isLoading: isLoadingSlots } = useSlots(
    turfId,
    date
  );
  const { data: blockedTimes = [], isLoading: isLoadingBlocked } =
    useBlockedTimes(turfId, date);
  const { data: blockedDates = [] } = useBlockedDates(turfId);

  const blockTimeMutation = useBlockTimeMutation();
  const unblockTimeMutation = useUnblockTimeMutation();

  const loading =
    isLoadingSlots ||
    isLoadingBlocked ||
    blockTimeMutation.isPending ||
    unblockTimeMutation.isPending;

  const isDateDisabled = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");

    return (
      isBefore(date, new Date()) ||
      blockedDates.some(
        (d) =>
          formattedDate === d.startDate ||
          (d.endDate &&
            formattedDate >= d.startDate &&
            formattedDate <= d.endDate)
      )
    );
  };

  const toggleBlockSlot = (time: string) => {
    setPendingBlockedSlots((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const handleSubmit = async () => {
    if (!turfId || !date) return;
    const formattedDate = format(date, "yyyy-MM-dd");
    try {
      await blockTimeMutation.mutateAsync({
        turfId,
        date: formattedDate,
        blockedTimes: pendingBlockedSlots,
      });
      toast.success("Blocked times updated successfully");
      setPendingBlockedSlots([]);
    } catch (error) {
      toast.error("Failed to update blocked times");
    }
  };

  const handleDelete = async (time: string) => {
    if (!turfId || !date) return;
    const formattedDate = format(date, "yyyy-MM-dd");
    try {
      await unblockTimeMutation.mutateAsync({
        turfId,
        date: formattedDate,
        time,
      });
      toast.success("Blocked time removed successfully");
    } catch (error) {
      toast.error("Failed to remove blocked time");
    }
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
                  {loading && !availableSlots.length ? (
                    <div className="col-span-full text-center py-12 text-gray-400">
                      Loading available slots...
                    </div>
                  ) : availableSlots.length > 0 ? (
                    availableSlots.map(({ time, isBooked, isBlocked }) => (
                      <div
                        key={time}
                        onClick={() => !isBooked && toggleBlockSlot(time)}
                        className={clsx(
                          "p-3 text-center rounded-lg text-sm border font-medium transition-all cursor-pointer select-none relative overflow-hidden",
                          isBooked
                            ? "bg-red-500/10 border-red-500/20 text-red-500 opacity-60 cursor-not-allowed"
                            : pendingBlockedSlots.includes(time) ||
                                blockedTimes.includes(time)
                              ? "bg-turf-neon/20 border-turf-neon text-turf-neon"
                              : "bg-white/5 border-white/10 text-gray-300 hover:border-turf-neon/50 hover:bg-white/10"
                        )}
                      >
                        {formatSlotTime(time)}
                        {(pendingBlockedSlots.includes(time) ||
                          blockedTimes.includes(time)) && (
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
                  disabled={!pendingBlockedSlots.length}
                  variant="primary"
                  glow
                  className="w-full md:w-auto"
                >
                  {loading ? "Saving Changes..." : "Save Blocked Slots"}
                </NeonButton>
              </div>
            </div>
          </GlassCard>

          {blockedTimes.length > 0 && (
            <GlassCard title="Blocked Slots Summary">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {blockedTimes.map((time) => (
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
