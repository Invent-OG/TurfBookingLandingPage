import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { events } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type Event = InferSelectModel<typeof events>;

interface CreateEventData extends Omit<
  Event,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "currentParticipants"
  | "status"
  | "createdBy"
> {
  currentParticipants?: number; // Optional on create
  status?: "upcoming" | "active" | "completed" | "cancelled";
  createdBy?: string | null;
}

export const useEvents = (filters?: { status?: string; turfId?: string }) => {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.turfId) params.append("turfId", filters.turfId);
      return apiClient.get<Event[]>(`/api/events?${params.toString()}`);
    },
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ["events", id],
    queryFn: () => apiClient.get<Event>(`/api/events/${id}`),
    enabled: !!id,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventData) =>
      apiClient.post<Event>("/api/events", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateEventData>;
    }) => apiClient.put<Event>(`/api/events/${id}`, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events", data.id] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useEventRegistrations = (eventId: string) => {
  return useQuery({
    queryKey: ["event-registrations", eventId],
    queryFn: () => apiClient.get<any[]>(`/api/events/${eventId}/registrations`),
    enabled: !!eventId,
  });
};

export const useUpcomingEvent = () => {
  return useQuery({
    queryKey: ["events", "upcoming"],
    queryFn: () => apiClient.get<Event | null>("/api/events/upcoming"),
  });
};
