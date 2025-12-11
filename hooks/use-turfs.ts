import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { turfs } from "@/db/schema";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type Turf = InferSelectModel<typeof turfs>;
export type NewTurf = InferInsertModel<typeof turfs>;

export const useTurfs = () => {
  return useQuery({
    queryKey: ["turfs"],
    queryFn: () => apiClient.get<Turf[]>("/api/turfs"),
  });
};

export const useTurf = (id: string) => {
  return useQuery({
    queryKey: ["turfs", id],
    queryFn: () => apiClient.get<Turf>(`/api/turfs/${id}`),
    enabled: !!id,
  });
};

export const useCreateTurf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NewTurf) => apiClient.post<Turf>("/api/turfs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["turfs"] });
    },
  });
};

export const useUpdateTurf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewTurf> }) =>
      apiClient.put<Turf>(`/api/turfs/${id}`, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["turfs"] });
      queryClient.invalidateQueries({ queryKey: ["turfs", data.id] });
    },
  });
};

export const useDeleteTurf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<Turf>(`/api/turfs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["turfs"] });
    },
  });
};
