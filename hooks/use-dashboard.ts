import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Booking } from "@/hooks/use-bookings";

export type DashboardData = {
  stats: {
    totalRevenue: number;
    activeBookings: number;
    totalCustomers: number;
  };
  recentBookings: Booking[]; // Using Booking type from use-bookings or similar
  chartData: {
    date: string; // serialized date
    name: string;
    revenue: number;
    bookings: number;
  }[];
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => apiClient.get<DashboardData>("/api/admin/dashboard"),
  });
};
