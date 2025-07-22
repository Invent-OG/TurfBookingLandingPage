"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { useTurfStore } from "@/lib/store/turf";
import { supabase } from "@/lib/supabase";
import { formatToAMPM } from "@/lib/convertTime";

type PeakHour = {
  id: string;
  turf_id: string;
  type: "day" | "date";
  days_of_week?: string[];
  specific_date?: string;
  start_time: string;
  end_time: string;
  price: number;
};

const mockTurfs = [
  { id: "1", name: "GRASP Turf" },
  { id: "2", name: "Downtown Arena" },
];

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
  const { turfs, setTurfs } = useTurfStore();

  const [selectedTurfId, setSelectedTurfId] = useState<string>();
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
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

  useEffect(() => {
    const fetchPeakHours = async () => {
      if (!selectedTurfId) return;
      const { data, error } = await supabase
        .from("turf_peak_hours")
        .select("*")
        .eq("turf_id", selectedTurfId);

      if (!error && data) {
        setPeakHours(data);
      }
    };
    fetchPeakHours();
  }, [selectedTurfId]);

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
      if (entry.turf_id !== selectedTurfId || entry.type !== type) return false;

      const overlap = (s1: string, e1: string, s2: string, e2: string) => {
        return s1 < e2 && s2 < e1;
      };

      if (type === "day") {
        return (
          entry.days_of_week?.some((d) => selectedDays.includes(d)) &&
          overlap(startTime, endTime, entry.start_time, entry.end_time)
        );
      } else {
        return (
          entry.specific_date === specificDate?.toISOString().split("T")[0] &&
          overlap(startTime, endTime, entry.start_time, entry.end_time)
        );
      }
    });

    if (overlapExists) {
      toast.error("Peak hour overlaps with an existing one");
      return;
    }

    startTransition(async () => {
      const newEntry = {
        turf_id: selectedTurfId,
        type,
        days_of_week: type === "day" ? selectedDays : null,
        specific_date:
          type === "date" && specificDate
            ? specificDate.toISOString().split("T")[0]
            : null,
        start_time: startTime,
        end_time: endTime,
        price: Number(price),
      };

      if (editMode && editingEntryId) {
        const { data, error } = await supabase
          .from("turf_peak_hours")
          .update(newEntry)
          .eq("id", editingEntryId)
          .select();

        if (!error && data) {
          setPeakHours((prev) =>
            prev.map((entry) => (entry.id === editingEntryId ? data[0] : entry))
          );
          toast.success("Peak hour updated successfully");
        } else toast.error("Update failed");
      } else {
        const { data, error } = await supabase
          .from("turf_peak_hours")
          .insert([newEntry])
          .select();

        if (!error && data) {
          setPeakHours([...peakHours, data[0]]);
          toast.success("Peak hour created successfully");
        } else toast.error("Creation failed");
      }

      resetForm();
    });
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    const { error } = await supabase
      .from("turf_peak_hours")
      .delete()
      .eq("id", confirmDeleteId);
    if (!error) {
      setPeakHours((prev) => prev.filter((p) => p.id !== confirmDeleteId));
      toast.success("Peak hour deleted successfully");
    } else toast.error("Delete failed");
    setConfirmDeleteId(null);
  };

  const handleEdit = (entry: PeakHour) => {
    setType(entry.type);
    setSelectedDays(entry.days_of_week || []);
    setSpecificDate(
      entry.specific_date ? new Date(entry.specific_date) : undefined
    );
    setStartTime(entry.start_time);
    setEndTime(entry.end_time);
    setPrice(entry.price.toString());
    setEditingEntryId(entry.id);
    setEditMode(true);
    setOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-5 items-center">
          <Label>Peak Hours for Turf:</Label>
          <Select value={selectedTurfId} onValueChange={setSelectedTurfId}>
            <SelectTrigger className="w-[200px]">
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
        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val);
            if (!val) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button disabled={!selectedTurfId}>+ Add Peak Hour</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editMode ? "Edit Peak Hour" : "Add Peak Hour"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div>
                <Label className="mb-1">Peak Hour Type</Label>
                <RadioGroup
                  value={type}
                  onValueChange={(v) => setType(v as "day" | "date")}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="day" id="day" />
                    <Label htmlFor="day">Recurring (Day)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="date" id="date" />
                    <Label htmlFor="date">Specific Date</Label>
                  </div>
                </RadioGroup>
              </div>
              {type === "day" ? (
                <div>
                  <Label>Select Days of Week</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {weekDays.map((day) => (
                      <label key={day} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          value={day}
                          checked={selectedDays.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDays([...selectedDays, day]);
                            } else {
                              setSelectedDays(
                                selectedDays.filter((d) => d !== day)
                              );
                            }
                          }}
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <Label>Select Date</Label>
                  <Calendar
                    mode="single"
                    selected={specificDate}
                    onSelect={setSpecificDate}
                    className="rounded-md border mt-1"
                  />
                  {specificDate && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected: {format(specificDate, "PPP")}
                    </p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button disabled={loading} onClick={handleSave}>
                {loading ? "Saving..." : editMode ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Peak Hours List</h3>
          {selectedTurfId ? (
            peakHours.length > 0 ? (
              peakHours.map((entry) => (
                <div
                  key={entry.id}
                  className="border p-3 rounded-md flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">
                      {entry.type === "day"
                        ? entry.days_of_week?.join(", ")
                        : entry.specific_date
                          ? format(new Date(entry.specific_date), "PPP")
                          : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatToAMPM(entry.start_time)} –
                      {formatToAMPM(entry.end_time)} | ₹{entry.price}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(entry)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setConfirmDeleteId(entry.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No peak hours for this turf yet.
              </p>
            )
          ) : (
            <p className="text-sm text-muted-foreground">
              Please select a turf to view its peak hours.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>
          <p>
            This action cannot be undone. This will permanently delete the peak
            hour slot.
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
