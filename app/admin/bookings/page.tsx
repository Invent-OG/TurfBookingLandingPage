"use client";
import React, { useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  Download,
  Trash,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, parse } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { GlassTable } from "@/components/ui/glass-table";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

export default function Bookings() {
  const queryClient = useQueryClient();
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  // TanStack Query for Fetching Bookings
  const { data, isLoading } = useQuery({
    queryKey: [
      "bookings",
      currentPage,
      itemsPerPage,
      searchQuery,
      selectedDate,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchQuery,
      });

      const res = await fetch(`/api/admin/bookings?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const result = await res.json();

      let fetchedData = result.data || [];
      // Client-side date filter (temporary, if API doesn't support it)
      if (selectedDate) {
        fetchedData = fetchedData.filter(
          (b: any) =>
            new Date(b.date).toDateString() === selectedDate.toDateString()
        );
      }
      return {
        data: fetchedData,
        totalPages: result.pagination?.totalPages || 1,
      };
    },
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });

  const bookings = data?.data || [];
  const totalPages = data?.totalPages || 1;

  // Mutation for Deleting Bookings
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (selectedBookings.length === 0) return;
      await apiClient.delete("/api/admin/bookings", { ids: selectedBookings });
    },
    onSuccess: () => {
      toast.success("Bookings deleted.");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setSelectedBookings([]);
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast.error("Failed to delete bookings.");
    },
  });

  const [issueRefund, setIssueRefund] = useState(false);

  // Mutation for Cancelling/Refunding Bookings
  const cancelMutation = useMutation({
    mutationFn: async ({ id, refund }: { id: string; refund: boolean }) => {
      const endpoint = refund
        ? `/api/admin/bookings/${id}/refund`
        : `/api/admin/bookings/${id}/cancel`;

      const res = await fetch(endpoint, {
        method: "POST",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to process request");
      }
      return res.json();
    },
    onSuccess: (data, variables) => {
      toast.success(
        variables.refund
          ? "Booking refunded successfully."
          : "Booking cancelled successfully."
      );
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setBookingToCancel(null);
      setIssueRefund(false); // Reset checkbox
    },
    onError: (error: Error) => {
      toast.error(error.message || "An error occurred.");
    },
  });

  const toggleSelectBooking = (id: string) => {
    setSelectedBookings((prev) =>
      prev.includes(id)
        ? prev.filter((bookingId) => bookingId !== id)
        : [...prev, id]
    );
  };

  const exportToCSV = () => {
    const dataToExport =
      selectedBookings.length > 0
        ? bookings.filter((b: any) => selectedBookings.includes(b.id))
        : bookings;

    if (dataToExport.length === 0) {
      toast.error("No bookings available for export.");
      return;
    }

    const csvData = dataToExport.map((b: any) => ({
      Name: b.customerName,
      Email: b.customerEmail,
      Turf: b.turfName,
      Date: b.date,
      "Start Time": formatSlotTime(b.startTime),
      Status: b.status,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bookings.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatSlotTime = (time: string) => {
    try {
      const parsedTime = parse(time, "HH:mm:ss", new Date());
      return format(parsedTime, "hh:mm a");
    } catch (e) {
      return time;
    }
  };

  const columns = [
    {
      header: "Select",
      accessor: (item: any) => (
        <Checkbox
          checked={selectedBookings.includes(item.id)}
          onCheckedChange={() => toggleSelectBooking(item.id)}
          className="border-gray-500 data-[state=checked]:bg-turf-neon data-[state=checked]:text-turf-dark"
        />
      ),
      className: "w-10",
    },
    {
      header: "Customer",
      accessor: (item: any) => (
        <div className="font-medium text-white">{item.customerName}</div>
      ),
    },
    { header: "Phone", accessor: (item: any) => item.customerPhone },
    {
      header: "Turf",
      accessor: (item: any) => (
        <span className="text-turf-blue">{item.turfName}</span>
      ),
    },
    { header: "Date", accessor: (item: any) => item.date },
    {
      header: "Time",
      accessor: (item: any) => formatSlotTime(item.startTime),
    },
    { header: "Duration", accessor: (item: any) => `${item.duration} hrs` },
    { header: "Price", accessor: (item: any) => `₹${item.totalPrice}` },
    {
      header: "Status",
      accessor: (item: any) => (
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
            item.status === "pending"
              ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/20"
              : item.status === "cancelled" || item.status === "refunded"
                ? "bg-red-500/20 text-red-500 border border-red-500/20"
                : "bg-turf-neon/20 text-turf-neon border border-turf-neon/20"
          )}
        >
          {item.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (item: any) => (
        <div className="flex justify-end gap-2">
          {["booked", "pending"].includes(item.status) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBookingToCancel(item.id);
              }}
              className="px-2 py-1 text-xs font-semibold text-red-400 border border-red-500/30 rounded hover:bg-red-500/10 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-heading tracking-wide">
            Bookings Management
          </h1>
          <p className="text-gray-400 mt-1">
            View and manage all turf reservations.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <NeonButton
            onClick={exportToCSV}
            variant="secondary"
            glow={false}
            className="flex-1 md:flex-none"
          >
            <Download className="w-4 h-4" /> Export
          </NeonButton>
          {selectedBookings.length > 0 && (
            <NeonButton
              onClick={() => setShowDeleteDialog(true)}
              variant="danger"
              className="flex-1 md:flex-none"
            >
              <Trash className="w-4 h-4" /> Delete ({selectedBookings.length})
            </NeonButton>
          )}
        </div>
      </div>

      <GlassCard className="p-0 overflow-visible" noPadding>
        {/* Filters Header */}
        <div className="p-4 border-b border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              placeholder="Search by name, email, or turf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-black/20 border-white/10 text-white placeholder-gray-500 focus:border-turf-neon/50"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                  <CalendarCheck className="w-4 h-4" />
                  {selectedDate
                    ? format(selectedDate, "MMM dd, yyyy")
                    : "Filter Date"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-turf-dark border-white/10">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="bg-turf-dark text-white rounded-md border-white/10"
                />
              </PopoverContent>
            </Popover>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(undefined)}
                className="text-xs text-red-400 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="p-10 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-turf-neon"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No bookings found matching your criteria.
          </div>
        ) : (
          <GlassTable columns={columns} data={bookings} />
        )}

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-white/10 bg-white/5 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Rows per page:</span>
            <Select
              value={String(itemsPerPage)}
              onValueChange={(val) => setItemsPerPage(Number(val))}
            >
              <SelectTrigger className="w-16 h-8 bg-black/20 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-turf-dark border-white/10 text-white">
                {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={String(opt)}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              Page {currentPage} of {totalPages || 1}
            </span>
            <div className="flex gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((c) => c + 1)}
                className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-turf-dark border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete {selectedBookings.length} selected
              booking(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <NeonButton
              variant="ghost"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </NeonButton>
            <NeonButton
              variant="danger"
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
            </NeonButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancellation Dialog */}
      <Dialog
        open={!!bookingToCancel}
        onOpenChange={(open) => {
          if (!open) {
            setBookingToCancel(null);
            setIssueRefund(false);
          }
        }}
      >
        <DialogContent className="bg-turf-dark border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to cancel this booking? This will free up
              the slot for others.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center space-x-2 py-4">
            <Checkbox
              id="refund"
              checked={issueRefund}
              onCheckedChange={(checked) => setIssueRefund(checked as boolean)}
              className="border-gray-500 data-[state=checked]:bg-turf-neon data-[state=checked]:text-black"
            />
            <label
              htmlFor="refund"
              className="text-sm font-medium leading-none text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Issue Refund via Cashfree
            </label>
          </div>

          <DialogFooter>
            <NeonButton
              variant="ghost"
              onClick={() => {
                setBookingToCancel(null);
                setIssueRefund(false);
              }}
            >
              Close
            </NeonButton>
            <NeonButton
              variant="danger"
              onClick={() =>
                bookingToCancel &&
                cancelMutation.mutate({
                  id: bookingToCancel,
                  refund: issueRefund,
                })
              }
            >
              {cancelMutation.isPending
                ? issueRefund
                  ? "Processing Refund..."
                  : "Cancelling..."
                : issueRefund
                  ? "Refund & Cancel"
                  : "Confirm Cancel"}
            </NeonButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
