import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { turfPeakHours } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type PeakHour = InferSelectModel<typeof turfPeakHours>;

export const usePeakHours = (turfId: string | undefined) => {
  return useQuery({
    queryKey: ["peak-hours", turfId],
    queryFn: () =>
      apiClient.get<PeakHour[]>(`/api/admin/peak-hours?turfId=${turfId}`),
    enabled: !!turfId,
  });
};

export const useCreatePeakHour = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PeakHour>) =>
      apiClient.post<PeakHour>("/api/admin/peak-hours", data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["peak-hours", variables.turfId],
      });
    },
  });
};

export const useUpdatePeakHour = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PeakHour> }) =>
      apiClient.put<PeakHour>(`/api/admin/peak-hours/${id}`, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["peak-hours", data.turfId] });
    },
  });
};

export const useDeletePeakHour = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/admin/peak-hours/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peak-hours"] }); // Invalidate all matching
    },
  });
};
