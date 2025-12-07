"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Download,
  Trash,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Search,
  Filter,
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

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

export default function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchQuery, selectedDate, bookings, itemsPerPage]);

  const fetchBookings = async () => {
    const { data, error } = await supabase.from("bookings").select("*");
    if (error) {
      toast.error("Failed to fetch bookings.");
    } else {
      setBookings(data || []);
      setFilteredBookings(data || []);
    }
  };

  const filterBookings = () => {
    let filtered = bookings.filter(
      (booking) =>
        booking.customer_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        booking.customer_email
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        booking.turf_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedDate) {
      filtered = filtered.filter(
        (booking) =>
          new Date(booking.date).toDateString() === selectedDate.toDateString()
      );
    }
    setFilteredBookings(filtered);
    setCurrentPage(1);
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBookings(paginatedBookings.map((booking) => booking.id));
    } else {
      setSelectedBookings([]);
    }
    setSelectAll(checked);
  };

  const toggleSelectBooking = (id: string) => {
    setSelectedBookings((prev) =>
      prev.includes(id)
        ? prev.filter((bookingId) => bookingId !== id)
        : [...prev, id]
    );
  };

  const deleteBookings = async () => {
    setShowDeleteDialog(false);
    if (selectedBookings.length === 0) {
      toast.error("No bookings selected.");
      return;
    }
    const { error } = await supabase
      .from("bookings")
      .delete()
      .in("id", selectedBookings);
    if (error) {
      toast.error("Failed to delete bookings.");
    } else {
      toast.success("Bookings deleted.");
      fetchBookings();
      setSelectedBookings([]);
    }
  };

  const exportToCSV = () => {
    const dataToExport =
      selectedBookings.length > 0
        ? filteredBookings.filter((b) => selectedBookings.includes(b.id))
        : filteredBookings;

    if (dataToExport.length === 0) {
      toast.error("No bookings available for export.");
      return;
    }

    const csvData = dataToExport.map((b) => ({
      Name: b.customer_name,
      Email: b.customer_email,
      Turf: b.turf_name,
      Date: b.date,
      "Start Time": formatSlotTime(b.start_time),
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

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        <div className="font-medium text-white">{item.customer_name}</div>
      ),
    },
    { header: "Phone", accessor: (item: any) => item.customer_phone },
    {
      header: "Turf",
      accessor: (item: any) => (
        <span className="text-turf-blue">{item.turf_name}</span>
      ),
    },
    { header: "Date", accessor: (item: any) => item.date },
    {
      header: "Time",
      accessor: (item: any) => formatSlotTime(item.start_time),
    },
    { header: "Duration", accessor: (item: any) => `${item.duration} hrs` },
    { header: "Price", accessor: (item: any) => `₹${item.total_price}` },
    {
      header: "Status",
      accessor: (item: any) => (
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
            item.status === "pending"
              ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/20"
              : item.status === "cancelled"
                ? "bg-red-500/20 text-red-500 border border-red-500/20"
                : "bg-turf-neon/20 text-turf-neon border border-turf-neon/20"
          )}
        >
          {item.status}
        </span>
      ),
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
        {paginatedBookings.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No bookings found matching your criteria.
          </div>
        ) : (
          <>
            {/* Special Checkbox Header Handling for Select All is needed if using generic GlassTable, 
                    but GlassTable maps columns directly. We can inject the header checkbox via a custom header renderer 
                    mocked in columns or just rely on individual select for now or update Glass table to support header components. 
                    For simplicity, we will assume the user manually selects or we'd need to update GlassTable signature. 
                    Let's update column def above to just include the checkbox in the first column header if we could. 
                    Actually, GlassTable takes strings for headers. Let's just keep 'Select' text for now.
                */}
            <GlassTable columns={columns} data={paginatedBookings} />
          </>
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
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((c) => c - 1)}
                className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                disabled={currentPage === totalPages}
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
            <NeonButton variant="danger" onClick={deleteBookings}>
              Confirm Delete
            </NeonButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
