"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  Download,
  Trash,
  ChevronLeft,
  ChevronRight,
  Menu,
  CalendarCheck,
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
      setBookings(data);
      setFilteredBookings(data);
    }
  };

  console.log(bookings, "bookings");
  console.log(filteredBookings, "filteredBookings");

  const filterBookings = () => {
    let filtered = bookings.filter(
      (booking) =>
        booking.customer_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        booking.customer_email
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        booking.turf_name.toLowerCase().includes(searchQuery.toLowerCase())
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

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(paginatedBookings.map((booking) => booking.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectBooking = (id: string) => {
    setSelectedBookings((prev) =>
      prev.includes(id)
        ? prev.filter((bookingId) => bookingId !== id)
        : [...prev, id]
    );
  };

  const confirmDelete = () => {
    setShowDeleteDialog(true);
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
      Duration: `${b.duration} hrs`,
      Price: `${b.total_price}`,
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
    const parsedTime = parse(time, "HH:mm:ss", new Date());
    return format(parsedTime, "hh:mm a");
  };

  return (
    <div className="flex flex-col gap-8 px-4 md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        {/* Heading and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
          <h1 className="text-xl sm:text-2xl font-bold">
            Bookings ({bookings.length})
          </h1>
          <Input
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[50%]"
          />
        </div>

        {/* Controls Section */}
        <div className="flex  sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <CalendarCheck />

                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>

          {/* Export CSV Button */}
          <Button onClick={exportToCSV} className="w-full sm:w-auto">
            <Download className="mr-2" /> Export CSV
          </Button>

          {/* Delete Selected Button (only shown if bookings are selected) */}
          {selectedBookings.length > 0 && (
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="w-full sm:w-auto"
            >
              <Trash className="mr-2" /> Delete Selected
            </Button>
          )}
        </div>
      </div>

      {paginatedBookings.length === 0 ? (
        <p className="text-center text-gray-500">No bookings available.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table className="w-full border rounded-lg">
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead>
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Turf</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedBookings.includes(booking.id)}
                        onCheckedChange={() => toggleSelectBooking(booking.id)}
                      />
                    </TableCell>
                    <TableCell>{booking.customer_name}</TableCell>
                    <TableCell>{booking.customer_phone}</TableCell>
                    <TableCell>{booking.turf_name}</TableCell>
                    <TableCell>{booking.date}</TableCell>
                    <TableCell>{formatSlotTime(booking.start_time)}</TableCell>
                    <TableCell>{booking.duration} hrs</TableCell>
                    <TableCell>₹{booking.total_price}</TableCell>
                    <TableCell>
                      <span
                        className={`capitalize rounded-md text-white p-2 font-bold ${
                          booking.status === "pending"
                            ? "bg-yellow-500"
                            : booking.status === "cancelled"
                              ? "bg-red-500"
                              : "bg-green-500"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Select
              onValueChange={(value) => setItemsPerPage(Number(value))}
              defaultValue="10"
            >
              <SelectTrigger className="w-34">
                <SelectValue placeholder="Per Page" />
              </SelectTrigger>
              <SelectContent>
                {ITEMS_PER_PAGE_OPTIONS.map((count) => (
                  <SelectItem key={count} value={String(count)}>
                    {count} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-5">
              <Button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft />
              </Button>

              <Button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedBookings.length} selected
              booking(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteBookings}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
