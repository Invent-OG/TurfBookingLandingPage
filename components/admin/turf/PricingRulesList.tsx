"use client";

import { NeonButton } from "@/components/ui/neon-button";
import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateTimeSlots } from "@/lib/convertTime";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface PricingRule {
  startTime: string;
  endTime: string;
  price: number;
}

interface PricingRulesListProps {
  label: string;
  rules: PricingRule[];
  onChange: (rules: PricingRule[]) => void;
  minTime?: string; // "HH:mm:ss" usually, we just need HH:mm
  maxTime?: string;
  interval?: number;
}

export function PricingRulesList({
  label,
  rules,
  onChange,
  minTime = "00:00:00",
  maxTime = "23:59:00",
  interval = 60,
}: PricingRulesListProps) {
  // 1. Generate all possible slots for the day based on interval
  const allSlots = useMemo(() => generateTimeSlots(interval), [interval]);

  // 2. Filter slots to be within Turf's Opening/Closing hours
  const validSlots = useMemo(() => {
    // Helper to compare "HH:mm" strings
    const toMinutes = (time: string) => {
      if (!time) return 0;
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const minMinutes = toMinutes(minTime);
    const maxMinutes = toMinutes(maxTime);

    return allSlots.filter((slot) => {
      const slotMinutes = toMinutes(slot.value);
      // Include start time, exclude strict end time for *start* selectors?
      // Actually, for ranges, we need available start times.
      // Usually you can't start at the exact closing time.
      return slotMinutes >= minMinutes && slotMinutes <= maxMinutes;
    });
  }, [allSlots, minTime, maxTime]);

  const addRule = () => {
    // Find first available slot (optional smart logic could go here)
    const nextStart =
      rules.length > 0
        ? rules[rules.length - 1].endTime
        : validSlots[0]?.value || "06:00";

    // Default duration 1 hour (or interval)
    // Simple logic: just add a placeholder, user picks
    onChange([
      ...rules,
      { startTime: nextStart, endTime: nextStart, price: 0 },
    ]);
  };

  const removeRule = (index: number) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    onChange(newRules);
  };

  const updateRule = (index: number, field: keyof PricingRule, value: any) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    onChange(newRules);
  };

  // 3. Helper to determine which slots are already "taken" by OTHER rules
  const getUsedIntervals = (excludeIndex: number) => {
    return rules
      .filter((_, i) => i !== excludeIndex)
      .map((r) => ({ start: r.startTime, end: r.endTime }));
  };

  const isTimeOverlap = (time: string, excludeIndex: number) => {
    // Helper to check if a specific time point is inside another rule
    // Note: This matches "Start Time" selection logic
    const used = getUsedIntervals(excludeIndex);
    return used.some((u) => time >= u.start && time < u.end);
  };

  // Design Classes (Neon Theme)
  const selectTriggerClass =
    "h-9 text-xs bg-black border-white/10 text-white hover:border-turf-neon/50 focus:ring-turf-neon/20 transition-all";
  const selectContentClass =
    "bg-black border border-white/10 text-white max-h-60";
  const selectItemClass =
    "text-white focus:bg-turf-neon focus:text-black cursor-pointer text-xs";

  return (
    <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          {label}
        </h4>
        <NeonButton
          onClick={addRule}
          variant="secondary"
          className="h-8 px-3 text-xs"
          type="button"
        >
          <Plus className="w-3 h-3 mr-1" /> Add Rule
        </NeonButton>
      </div>

      <div className="space-y-4">
        {rules.map((rule, index) => {
          // For Start Time: Filter out anything that overlaps existing rules
          const availableStartTimes = validSlots.filter(
            (s) =>
              !isTimeOverlap(s.value, index) &&
              s.value < (maxTime.slice(0, 5) || "23:59")
          );

          // For End Time: Must be > StartTime.
          // Stop at the NEXT rule's start time (cannot overlap next rule).
          const currentStart = rule.startTime;

          // Find the nearest start time of another rule that is AFTER currentStart
          const nextRuleStart = rules
            .filter((_, i) => i !== index && _.startTime > currentStart)
            .sort((a, b) =>
              a.startTime.localeCompare(b.startTime)
            )[0]?.startTime;

          const availableEndTimes = validSlots.filter((s) => {
            if (s.value <= currentStart) return false;
            if (nextRuleStart && s.value > nextRuleStart) return false;
            return true;
          });

          return (
            <div
              key={index}
              className="grid grid-cols-12 gap-3 items-end bg-black/40 p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="col-span-4">
                <Label className="text-xs text-gray-500 mb-1 block">
                  Start
                </Label>
                <Select
                  value={rule.startTime}
                  onValueChange={(val) => updateRule(index, "startTime", val)}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Start" />
                  </SelectTrigger>
                  <SelectContent className={selectContentClass}>
                    {availableStartTimes.map((slot) => (
                      <SelectItem
                        key={slot.value}
                        value={slot.value}
                        className={selectItemClass}
                      >
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-4">
                <Label className="text-xs text-gray-500 mb-1 block">End</Label>
                <Select
                  value={rule.endTime}
                  onValueChange={(val) => updateRule(index, "endTime", val)}
                  disabled={!rule.startTime}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="End" />
                  </SelectTrigger>
                  <SelectContent className={selectContentClass}>
                    {availableEndTimes.map((slot) => (
                      <SelectItem
                        key={slot.value}
                        value={slot.value}
                        className={selectItemClass}
                      >
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-3">
                <Label className="text-xs text-gray-500 mb-1 block">
                  Price
                </Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    ₹
                  </span>
                  <NumberInput
                    value={rule.price}
                    onChange={(val) => updateRule(index, "price", val)}
                    className="h-9 pl-5 text-xs bg-black border-white/10 focus:border-turf-neon/50 transition-all text-white"
                    min={0}
                  />
                </div>
              </div>

              <div className="col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeRule(index)}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {rules.length === 0 && (
          <div className="text-center py-6 text-gray-500 text-sm border border-dashed border-white/10 rounded-lg bg-black/20">
            No custom pricing rules. Base price will apply.
          </div>
        )}
      </div>
    </div>
  );
}
