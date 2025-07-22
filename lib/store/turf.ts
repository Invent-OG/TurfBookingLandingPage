import { Turf } from "@/types/turf";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface TurfStore {
  turfs: Turf[];
  selectedTurf: Turf | null;
  setTurfs: (data: Turf[]) => void;
  setSelectedTurf: (turf: Turf | null) => void;
}

export const useTurfStore = create<TurfStore>()(
  devtools(
    persist(
      (set) => ({
        turfs: [],
        selectedTurf: null,

        setTurfs: (data) => set({ turfs: data }, false, "SET_TURFS"),

        setSelectedTurf: (turf) =>
          set({ selectedTurf: turf }, false, "SET_SELECTED_TURF"),
      }),
      { name: "turf-storage" }
    ),
    { name: "Turf Store" }
  )
);
