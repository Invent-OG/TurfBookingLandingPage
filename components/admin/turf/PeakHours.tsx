"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

const dayOptions = [
  { label: "Sunday", value: "0" },
  { label: "Monday", value: "1" },
  { label: "Tuesday", value: "2" },
  { label: "Wednesday", value: "3" },
  { label: "Thursday", value: "4" },
  { label: "Friday", value: "5" },
  { label: "Saturday", value: "6" },
];

interface PeakHourEntry {
  type: "repeat" | "specific";
  dayOfWeek?: string[];
  date?: string;
  startTime: string;
  endTime: string;
  price: number;
  error?: string | null;
}

interface Props {
  value: PeakHourEntry[];
  onChange: (updated: PeakHourEntry[]) => void;
  onSave: (data: PeakHourEntry[]) => void;
}

export default function PeakHourEntryManager({
  value,
  onChange,
  onSave,
}: Props) {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const addEntry = (type: "repeat" | "specific") => {
    const newEntry: PeakHourEntry =
      type === "repeat"
        ? {
            type,
            dayOfWeek: [],
            startTime: "06:00",
            endTime: "09:00",
            price: 0,
          }
        : { type, date: "", startTime: "06:00", endTime: "09:00", price: 0 };
    onChange([...value, newEntry]);
  };

  const updateEntry = (index: number, key: string, val: any) => {
    const updated = [...value];
    updated[index][key as keyof PeakHourEntry] = val;
    onChange(updated);
  };

  const toggleDayOfWeek = (index: number, val: string) => {
    const updated = [...value];
    const entry = updated[index];
    if (!Array.isArray(entry.dayOfWeek)) entry.dayOfWeek = [];
    if (entry.dayOfWeek.includes(val)) {
      entry.dayOfWeek = entry.dayOfWeek.filter((v) => v !== val);
    } else {
      entry.dayOfWeek.push(val);
    }
    onChange(updated);
  };

  const removeEntry = (index: number) => {
    const updated = [...value];
    updated.splice(index, 1);
    onChange(updated);
  };

  const validateEntry = (entry: PeakHourEntry): string | null => {
    if (
      entry.type === "repeat" &&
      (!entry.dayOfWeek || entry.dayOfWeek.length === 0)
    )
      return "Missing day(s) of week.";
    if (entry.type === "specific" && !entry.date)
      return "Missing specific date.";
    if (!entry.startTime || !entry.endTime)
      return "Start and end times are required.";
    if (entry.startTime >= entry.endTime)
      return "Start time must be before end time.";
    if (entry.price === null || entry.price < 0) return "Invalid price.";
    return null;
  };

  const handleSave = () => {
    const errors: string[] = [];
    const entryErrors: { [key: number]: string } = {};

    value.forEach((entry, index) => {
      const error = validateEntry(entry);
      if (error) {
        errors.push(`Entry ${index + 1}: ${error}`);
        entryErrors[index] = error;
      }
    });

    if (errors.length > 0) {
      const updated = value.map((entry, index) => ({
        ...entry,
        error: entryErrors[index] || null,
      }));
      setErrorMessages(errors);
      onChange(updated);
      return;
    }

    setErrorMessages([]);
    const cleaned = value.map(({ error, ...rest }) => rest);
    onSave(cleaned);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => addEntry("repeat")}>
          Add Repeat Day
        </Button>
        <Button variant="outline" onClick={() => addEntry("specific")}>
          Add Specific Date
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>

      {errorMessages.length > 0 && (
        <div className="text-red-500 space-y-1">
          {errorMessages.map((err, i) => (
            <div key={i}>{err}</div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {value.map((entry, index) => (
          <Card key={index} className="relative">
            <CardContent className="space-y-4 p-4">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => removeEntry(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              {entry.type === "repeat" ? (
                <div>
                  <Label>Day(s) of Week</Label>
                  <div className="flex flex-wrap gap-2">
                    {dayOptions.map((day) => (
                      <Button
                        key={day.value}
                        variant={
                          entry.dayOfWeek?.includes(day.value)
                            ? "default"
                            : "outline"
                        }
                        onClick={() => toggleDayOfWeek(index, day.value)}
                        className="text-sm"
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={entry.date}
                    onChange={(e) => updateEntry(index, "date", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={entry.startTime}
                    onChange={(e) =>
                      updateEntry(index, "startTime", e.target.value)
                    }
                    step="1800"
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={entry.endTime}
                    onChange={(e) =>
                      updateEntry(index, "endTime", e.target.value)
                    }
                    step="1800"
                  />
                </div>
              </div>

              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={entry.price}
                  onChange={(e) =>
                    updateEntry(index, "price", Number(e.target.value))
                  }
                />
              </div>

              {entry.error && (
                <div className="text-sm text-red-500">{entry.error}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
