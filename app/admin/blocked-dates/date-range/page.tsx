"use client";

import { useState } from "react";
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
import { format, isBefore, isAfter } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Trash2, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
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

  // Fetch blocked dates and bookings using hooks
  const { data: blockedDates = [] } = useBlockedDates(selectedTurf);
  const { data: bookings = [] } = useBookings(selectedTurf);

  const createBlockedDateMutation = useCreateBlockedDate();
  const deleteBlockedDateMutation = useDeleteBlockedDate();

  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [reason, setReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

    try {
      await createBlockedDateMutation.mutateAsync({
        turfId: selectedTurf,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        reason,
        blockedTimes: [],
      });
      toast.success("Date range blocked successfully!");
      setDialogOpen(false);
      setDateRange({ from: undefined, to: undefined });
      setReason("");
    } catch (error) {
      toast.error("Failed to block date range.");
    }
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteBlockedDateMutation.mutateAsync(confirmDeleteId);
      toast.success("Blocked date range removed successfully.");
    } catch (error) {
      toast.error("Failed to delete blocked date range.");
    } finally {
      setConfirmDeleteId(null);
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
                          !dateRange?.from ? "text-gray-500" : "text-white"
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
                  .filter((d) => d.endDate)
                  .map((blockedDate) => (
                    <tr
                      key={blockedDate.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-white font-medium">
                        {format(new Date(blockedDate.startDate), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-white font-medium">
                        {blockedDate.endDate
                          ? format(new Date(blockedDate.endDate), "MMM d, yyyy")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {blockedDate.reason}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <NeonButton
                          size="sm"
                          variant="danger"
                          onClick={() => setConfirmDeleteId(blockedDate.id)}
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

      <ConfirmationModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Blocked Range"
        description="Are you sure you want to unblock this date range? This action cannot be undone."
        loading={deleteBlockedDateMutation.isPending}
      />
    </div>
  );
}
