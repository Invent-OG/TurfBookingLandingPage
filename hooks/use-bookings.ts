import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { bookings } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type Booking = InferSelectModel<typeof bookings>;

export const useBookings = (turfId: string | undefined) => {
  return useQuery({
    queryKey: ["bookings", turfId],
    queryFn: () => apiClient.get<Booking[]>(`/api/bookings?turfId=${turfId}`),
    enabled: !!turfId,
  });
};

export const useBooking = (bookingId: string | null) => {
  return useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => apiClient.get<Booking>(`/api/bookings/${bookingId}`),
    enabled: !!bookingId,
  });
};

export const useVerifyPayment = () => {
  return useMutation({
    mutationFn: (bookingId: string) =>
      apiClient.post("/api/payment/verify", { bookingId }),
  });
};

export const useAdminBookings = () => {
  return useQuery({
    queryKey: ["admin-bookings"],
  });
};

export const useCreateManualBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post("/api/bookings/manual", data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["bookings", variables.turfId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
  });
};
