import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { blockedDates } from "@/db/schema";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type BlockedDate = InferSelectModel<typeof blockedDates>;
export type NewBlockedDate = InferInsertModel<typeof blockedDates>;

export const useBlockedDates = (turfId: string | undefined) => {
  return useQuery({
    queryKey: ["blocked-dates", turfId],
    queryFn: () =>
      apiClient.get<BlockedDate[]>(`/api/blocked-dates?turfId=${turfId}`),
    enabled: !!turfId,
  });
};

export const useCreateBlockedDate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<NewBlockedDate>) =>
      apiClient.post<BlockedDate>("/api/blocked-dates", data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["blocked-dates", variables.turfId],
      });
      queryClient.invalidateQueries({ queryKey: ["blocked-dates"] }); // Conservative invalidation
    },
  });
};

export const useDeleteBlockedDate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/blocked-dates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-dates"] });
    },
  });
};
