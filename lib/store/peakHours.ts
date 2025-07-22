// store/peakHours.ts

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

export type PeakHour = {
  id: string;
  turf_id: string;
  type: "day" | "date";
  days_of_week?: string[];
  specific_date?: string;
  start_time: string;
  end_time: string;
  price: number;
};

interface PeakHourState {
  peakHours: PeakHour[];
  setPeakHours: (data: PeakHour[]) => void;
  addPeakHour: (entry: PeakHour) => void;
  updatePeakHour: (entry: PeakHour) => void;
  removePeakHour: (id: string) => void;
  resetPeakHours: () => void;
}

export const usePeakHourStore = create<PeakHourState>()(
  devtools(
    persist(
      (set) => ({
        peakHours: [],
        setPeakHours: (data) => set({ peakHours: data }),
        addPeakHour: (entry) =>
          set((state) => ({ peakHours: [...state.peakHours, entry] })),
        updatePeakHour: (updated) =>
          set((state) => ({
            peakHours: state.peakHours.map((entry) =>
              entry.id === updated.id ? updated : entry
            ),
          })),
        removePeakHour: (id) =>
          set((state) => ({
            peakHours: state.peakHours.filter((entry) => entry.id !== id),
          })),
        resetPeakHours: () => set({ peakHours: [] }),
      }),
      {
        name: "peak-hour-storage", // localStorage key
      }
    ),
    {
      name: "PeakHourStore", // shown in Redux DevTools
    }
  )
);
