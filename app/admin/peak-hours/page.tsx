"use client";

import { useEffect, useState, useTransition } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Input } from "@/components/ui/input";
import { TimePicker } from "@/components/ui/time-picker";
import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { z } from "zod";
import {
  usePeakHours,
  useCreatePeakHour,
  useUpdatePeakHour,
  useDeletePeakHour,
  PeakHour,
} from "@/hooks/use-peak-hours";
import { useTurfs } from "@/hooks/use-turfs";
import { CalendarIcon, Clock, Edit2, Plus, Trash2 } from "lucide-react";
import { formatToAMPM } from "@/lib/convertTime";

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const peakHourSchema = z.object({
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  price: z.string().min(1, "Price is required"),
  selectedDays: z.array(z.string()).optional(),
  specificDate: z.date().optional(),
});

export default function TurfPeakHoursUI() {
  const { data: turfs = [] } = useTurfs();
  const [selectedTurfId, setSelectedTurfId] = useState<string>();
  const { data: peakHours = [] } = usePeakHours(selectedTurfId);
  const createMutation = useCreatePeakHour();
  const updateMutation = useUpdatePeakHour();
  const deleteMutation = useDeletePeakHour();

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [loading, startTransition] = useTransition();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [type, setType] = useState<"day" | "date">("day");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [specificDate, setSpecificDate] = useState<Date>();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [price, setPrice] = useState("");

  const resetForm = () => {
    setSelectedDays([]);
    setSpecificDate(undefined);
    setStartTime("");
    setEndTime("");
    setPrice("");
    setEditMode(false);
    setEditingEntryId(null);
    setOpen(false);
  };

  const handleSave = async () => {
    const result = peakHourSchema.safeParse({
      startTime,
      endTime,
      price,
      selectedDays,
      specificDate,
    });

    if (!result.success) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!selectedTurfId) return;

    const start = parseInt(startTime.replace(":", ""), 10);
    const end = parseInt(endTime.replace(":", ""), 10);
    if (start >= end) {
      toast.error("Start time must be earlier than end time.");
      return;
    }

    const overlapExists = peakHours.some((entry) => {
      if (editMode && editingEntryId === entry.id) return false;
      // entry.type is just "day" or "date" from DB, casting safe if validated
      if (entry.turfId !== selectedTurfId || entry.type !== type) return false;

      const overlap = (s1: string, e1: string, s2: string, e2: string) => {
        return s1 < e2 && s2 < e1;
      };

      if (type === "day") {
        return (
          entry.daysOfWeek?.some((d: string) => selectedDays.includes(d)) &&
          overlap(startTime, endTime, entry.startTime, entry.endTime)
        );
      } else {
        return (
          entry.specificDate ===
            (specificDate?.toISOString().split("T")[0] || "") &&
          overlap(startTime, endTime, entry.startTime, entry.endTime)
        );
      }
    });

    if (overlapExists) {
      toast.error("Peak hour overlaps with an existing one");
      return;
    }

    startTransition(async () => {
      const entryData = {
        turfId: selectedTurfId, // Ensure turfId is passed
        type,
        daysOfWeek: type === "day" ? selectedDays : null,
        specificDate:
          type === "date" && specificDate
            ? specificDate.toISOString().split("T")[0]
            : null,
        startTime,
        endTime,
        price,
      };

      try {
        if (editMode && editingEntryId) {
          await updateMutation.mutateAsync({
            id: editingEntryId,
            data: entryData,
          });
          toast.success("Peak hour updated successfully");
        } else {
          await createMutation.mutateAsync(entryData);
          toast.success("Peak hour created successfully");
        }
        resetForm();
      } catch (e) {
        toast.error("Operation failed");
      }
    });
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteMutation.mutateAsync(confirmDeleteId);
      toast.success("Peak hour deleted successfully");
    } catch (e) {
      toast.error("Delete failed");
    }
    setConfirmDeleteId(null);
  };

  const handleEdit = (entry: PeakHour) => {
    setType(entry.type as "day" | "date");
    setSelectedDays(entry.daysOfWeek || []); // camelCase from Hook/DB schema
    setSpecificDate(
      entry.specificDate ? new Date(entry.specificDate) : undefined
    );
    setStartTime(entry.startTime);
    setEndTime(entry.endTime);
    setPrice(entry.price);
    setEditingEntryId(entry.id);
    setEditMode(true);
    setOpen(true);
  };

  const inputClasses =
    "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-turf-neon/50 focus:ring-1 focus:ring-turf-neon/20 rounded-xl";
  const labelClasses = "text-gray-300 font-medium mb-1.5 block";

  return (
    <div className="max-w-5xl mx-auto pb-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white font-heading tracking-wide">
          Peak Hours Management
        </h1>
        <p className="text-gray-400 mt-1">
          Set custom pricing for specific times and days to maximize revenue.
        </p>
      </div>

      <GlassCard className="overflow-visible">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex-1 w-full md:w-auto space-y-2">
            <Label className={labelClasses}>Select Arena</Label>
            <Select value={selectedTurfId} onValueChange={setSelectedTurfId}>
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

          <Dialog
            open={open}
            onOpenChange={(val) => {
              setOpen(val);
              if (!val) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <NeonButton
                disabled={!selectedTurfId}
                variant="primary"
                glow
                className="mt-6 md:mt-2"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Peak Hour slot
              </NeonButton>
            </DialogTrigger>
            <DialogContent className="bg-turf-dark border border-white/10 text-white max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editMode ? "Edit Peak Hour" : "Add Peak Hour Configuration"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-3">
                  <Label className={labelClasses}>Configuration Type</Label>
                  <RadioGroup
                    value={type}
                    onValueChange={(v) => setType(v as "day" | "date")}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2 border border-white/10 rounded-lg p-3 flex-1 justify-center cursor-pointer hover:bg-white/5 transition-colors">
                      <RadioGroupItem value="day" id="day" />
                      <Label htmlFor="day" className="cursor-pointer mb-0">
                        Recurring (Day)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border border-white/10 rounded-lg p-3 flex-1 justify-center cursor-pointer hover:bg-white/5 transition-colors">
                      <RadioGroupItem value="date" id="date" />
                      <Label htmlFor="date" className="cursor-pointer mb-0">
                        Specific Date
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {type === "day" ? (
                  <div className="space-y-3">
                    <Label className={labelClasses}>Select Days</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {weekDays.map((day) => (
                        <label
                          key={day}
                          className={`flex items-center justify-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${selectedDays.includes(day) ? "bg-turf-neon/20 border-turf-neon text-white" : "border-white/10 hover:bg-white/5 text-gray-400"}`}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            value={day}
                            checked={selectedDays.includes(day)}
                            onChange={(e) => {
                              if (e.target.checked)
                                setSelectedDays([...selectedDays, day]);
                              else
                                setSelectedDays(
                                  selectedDays.filter((d) => d !== day)
                                );
                            }}
                          />
                          <span className="text-xs font-medium">
                            {day.slice(0, 3)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label className={labelClasses}>Select Date</Label>
                    <Calendar
                      mode="single"
                      selected={specificDate}
                      onSelect={setSpecificDate}
                      className="rounded-xl border border-white/10 bg-white/5 text-white"
                    />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className={labelClasses}>Start Time</Label>
                    <TimePicker
                      value={startTime}
                      onChange={setStartTime}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className={labelClasses}>End Time</Label>
                    <TimePicker
                      value={endTime}
                      onChange={setEndTime}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className={labelClasses}>Price (₹)</Label>
                    <NumberInput
                      value={price ? Number(price) : 0}
                      onChange={(val) => setPrice(val.toString())}
                      min={0}
                      step={100}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <NeonButton
                  disabled={loading}
                  onClick={handleSave}
                  variant="primary"
                  glow
                  className="w-full"
                >
                  {loading
                    ? "Saving..."
                    : editMode
                      ? "Update Configuration"
                      : "Save Configuration"}
                </NeonButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">
            Active Configurations
          </h3>
          {selectedTurfId ? (
            peakHours.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {peakHours.map((entry) => (
                  <div
                    key={entry.id}
                    className="relative group bg-white/5 border border-white/10 rounded-xl p-5 hover:border-turf-neon/50 transition-all hover:bg-white/[0.07]"
                  >
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="p-1.5 rounded-lg bg-turf-blue/20 text-turf-blue hover:bg-turf-blue/30"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(entry.id)}
                        className="p-1.5 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-turf-neon/10 text-turf-neon">
                        {entry.type === "day" ? (
                          <CalendarIcon className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white uppercase tracking-wider">
                          {entry.type === "day"
                            ? "Weekly Recurring"
                            : "One-time Override"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {entry.type === "day"
                            ? entry.daysOfWeek?.join(", ")
                            : entry.specificDate
                              ? format(new Date(entry.specificDate), "PPP")
                              : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="text-sm text-gray-300">
                        {formatToAMPM(entry.startTime)} –{" "}
                        {formatToAMPM(entry.endTime)}
                      </div>
                      <div className="text-lg font-bold text-turf-neon">
                        ₹{entry.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 bg-white/5 rounded-xl border border-white/5 border-dashed">
                No peak hour configurations found for this arena.
              </div>
            )
          ) : (
            <div className="text-center py-10 text-gray-500 bg-white/5 rounded-xl border border-white/5 border-dashed">
              Please select an arena above to manage peak hours.
            </div>
          )}
        </div>
      </GlassCard>

      <Dialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <DialogContent className="bg-turf-dark border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Delete Configuration?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400">
            This action cannot be undone. This pricing rule will be permanently
            removed.
          </p>
          <DialogFooter className="mt-4">
            <NeonButton
              variant="ghost"
              onClick={() => setConfirmDeleteId(null)}
            >
              Cancel
            </NeonButton>
            <NeonButton variant="danger" onClick={handleDelete}>
              Delete
            </NeonButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
