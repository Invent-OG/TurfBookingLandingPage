import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { format } from "date-fns";

export type Slot = {
  time: string;
  isBooked: boolean;
  isBlocked?: boolean;
};

export const useSlots = (turfId: string | undefined, date: Date | null) => {
  return useQuery({
    queryKey: ["slots", turfId, date ? format(date, "yyyy-MM-dd") : null],
    queryFn: async () => {
      if (!turfId || !date) return [];
      const formattedDate = format(date, "yyyy-MM-dd");
      const localTime = new Date().toTimeString().split(" ")[0];
      const data = await apiClient.get<{ availableSlots: Slot[] }>(
        `/api/bookings/slots?turfId=${turfId}&date=${formattedDate}&localTime=${localTime}`
      );
      return data.availableSlots || [];
    },
    enabled: !!turfId && !!date,
  });
};

export const useBlockedTimes = (
  turfId: string | undefined,
  date: Date | null
) => {
  return useQuery({
    queryKey: [
      "blocked-time",
      turfId,
      date ? format(date, "yyyy-MM-dd") : null,
    ],
    queryFn: async () => {
      if (!turfId || !date) return [];
      const formattedDate = format(date, "yyyy-MM-dd");
      const data = await apiClient.get<{ blockedTimes: string[] }>(
        `/api/block-time?turfId=${turfId}&date=${formattedDate}`
      );
      return data.blockedTimes || [];
    },
    enabled: !!turfId && !!date,
  });
};

export const useBlockTimeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      turfId: string;
      date: string;
      blockedTimes: string[];
    }) => apiClient.post("/api/block-time", data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["blocked-time", variables.turfId, variables.date],
      });
      queryClient.invalidateQueries({
        queryKey: ["slots", variables.turfId, variables.date],
      });
    },
  });
};

export const useUnblockTimeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { turfId: string; date: string; time: string }) =>
      apiClient.delete("/api/block-time", data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["blocked-time", variables.turfId],
      }); // Less specific invalidation to be safe
      queryClient.invalidateQueries({ queryKey: ["slots", variables.turfId] });
    },
  });
};
