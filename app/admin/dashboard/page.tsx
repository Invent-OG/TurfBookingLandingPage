"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Users, CreditCard, Activity, CalendarCheck } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassTable } from "@/components/ui/glass-table";
import { NeonButton } from "@/components/ui/neon-button";
import { cn } from "@/lib/utils";
import { format, subDays, startOfDay, endOfDay, isSameDay } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDashboardStats } from "@/hooks/use-dashboard";

export default function Dashboard() {
  const { data, isLoading: loading, error } = useDashboardStats();
  const router = useRouter();

  // Derived state from hook data
  const stats = [
    {
      title: "Total Revenue",
      value: `₹${data?.stats.totalRevenue.toLocaleString() || "0"}`,
      icon: CreditCard,
      trend: { value: 0, isPositive: true },
      color: "neon" as const,
    },
    {
      title: "Active Bookings",
      value: data?.stats.activeBookings || 0,
      icon: CalendarCheck,
      trend: { value: 0, isPositive: true },
      color: "white" as const,
    },
    {
      title: "Total Customers",
      value: data?.stats.totalCustomers || 0,
      icon: Users,
      trend: { value: 0, isPositive: true },
      color: "white" as const,
    },
  ];

  const recentBookings =
    data?.recentBookings.map((b) => ({
      id: b.id.slice(0, 8).toUpperCase(),
      user: b.customerName,
      turf: b.turfName,
      date: b.date,
      status: b.status.charAt(0).toUpperCase() + b.status.slice(1),
      amount: `₹${b.totalPrice}`,
    })) || [];

  const chartData = data?.chartData || [];

  useEffect(() => {
    if (error) {
      toast.error("Failed to load dashboard data");
    }
  }, [error]);

  const columns = [
    {
      header: "ID",
      accessor: (item: any) => (
        <span className="font-mono text-gray-400 text-xs">#{item.id}</span>
      ),
    },
    { header: "Customer", accessor: (item: any) => item.user },
    {
      header: "Turf",
      accessor: (item: any) => (
        <span className="text-white text-sm">{item.turf}</span>
      ),
    },
    { header: "Date", accessor: (item: any) => item.date },
    {
      header: "Status",
      accessor: (item: any) => (
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            item.status === "Confirmed"
              ? "bg-turf-neon/10 text-turf-neon border-turf-neon/20"
              : item.status === "Pending"
                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                : "bg-red-500/10 text-red-500 border-red-500/20"
          )}
        >
          {item.status}
        </span>
      ),
    },
    {
      header: "Amount",
      accessor: (item: any) => (
        <span className="text-white font-bold">{item.amount}</span>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-heading tracking-wide">
            Dashboard Overview
          </h1>
          <p className="text-gray-400 mt-1">
            Real-time insights across your arena network.
          </p>
        </div>
        <div className="flex gap-3">
          <NeonButton onClick={() => router.push("/admin/create-booking")}>
            New Booking
          </NeonButton>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} loading={loading} />
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <GlassCard
          title="Revenue Trends (7 Days)"
          className="lg:col-span-2 min-h-[400px]"
        >
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ccff00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ccff00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f1115",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#ccff00" }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#ccff00"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Bookings Chart */}
        <GlassCard title="Weekly Bookings" className="min-h-[400px]">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{
                    backgroundColor: "#0f1115",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="bookings" fill="#ffffff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity Table */}
      <GlassCard
        title="Recent Bookings"
        action={
          <button
            onClick={() => router.push("/admin/bookings")}
            className="text-sm text-turf-neon hover:underline"
          >
            View All
          </button>
        }
        noPadding
      >
        <GlassTable
          columns={columns}
          data={recentBookings}
          isLoading={loading}
        />
      </GlassCard>
    </div>
  );
}
