"use client";

import { useState } from "react";
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
import { format, isBefore } from "date-fns";
import { Ban, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useTurfs } from "@/hooks/use-turfs";
import {
  useBlockedDates,
  useCreateBlockedDate,
  useDeleteBlockedDate,
} from "@/hooks/use-blocked-dates";
import { useBookings } from "@/hooks/use-bookings";

export default function BlockDatePage() {
  const { data: turfs = [] } = useTurfs();
  const [selectedTurf, setSelectedTurf] = useState<string | undefined>(
    undefined
  );

  const { data: blockedDates = [] } = useBlockedDates(selectedTurf);
  const { data: bookings = [] } = useBookings(selectedTurf);

  const createBlockedDateMutation = useCreateBlockedDate();
  const deleteBlockedDateMutation = useDeleteBlockedDate();

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

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
      ) ||
      bookings.some((b) => b.date === formattedDate)
    );
  };

  const createBlockedDate = async () => {
    if (!selectedTurf || !date) {
      toast.error("Turf and Date are required!");
      return;
    }

    const formattedDate = format(date, "yyyy-MM-dd");
    if (blockedDates.some((d) => d.startDate === formattedDate)) {
      toast.error("This date is already blocked.");
      return;
    }

    try {
      await createBlockedDateMutation.mutateAsync({
        turfId: selectedTurf,
        startDate: formattedDate,
        reason,
        blockedTimes: [], // Empty array for full day block
      });
      toast.success("Date blocked successfully!");
      setDialogOpen(false);
      setDate(undefined);
      setReason("");
    } catch (error) {
      toast.error("Failed to block date.");
    }
  };

  const deleteBlockedDate = async (id: string) => {
    try {
      await deleteBlockedDateMutation.mutateAsync(id);
      toast.success("Blocked date removed successfully.");
    } catch (error) {
      toast.error("Failed to delete blocked date.");
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
                  !d.endDate && (!d.blockedTimes || d.blockedTimes.length === 0)
              ).length > 0 ? (
                blockedDates
                  .filter(
                    (d) =>
                      !d.endDate &&
                      (!d.blockedTimes || d.blockedTimes.length === 0)
                  )
                  .map((blockedDate) => (
                    <tr
                      key={blockedDate.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-white font-medium flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-turf-neon" />
                        {format(new Date(blockedDate.startDate), "MMM d, yyyy")}
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
