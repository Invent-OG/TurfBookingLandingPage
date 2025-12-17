"use client";

import { useState } from "react";
import {
  Search,
  Mail,
  Phone,
  Download,
  X,
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlassCard } from "@/components/ui/glass-card";
import { useQuery } from "@tanstack/react-query";

interface Customer {
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  lastBooking: string;
  totalSpent: number;
}

interface Booking {
  id: string;
  turfName: string;
  date: string;
  startTime: string;
  duration: number;
  totalPrice: string;
  status: string;
}

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  // TanStack Query for Customers
  const { data: customerData, isLoading: loading } = useQuery({
    queryKey: ["customers", currentPage, itemsPerPage, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
      });

      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch customers");
      const result = await res.json();
      return {
        customers: result.customers || [],
        totalPages: result.pagination?.totalPages || 1,
      };
    },
    placeholderData: (prev) => prev,
  });

  const customers = customerData?.customers || [];
  const totalPages = customerData?.totalPages || 1;

  // TanStack Query for Customer Bookings (Enabled only when customer selected)
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["customer-bookings", selectedCustomer?.email],
    queryFn: async () => {
      if (!selectedCustomer?.email) return { bookings: [] };
      const res = await fetch(
        `/api/admin/bookings/user?email=${selectedCustomer.email}`
      );
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
    enabled: !!selectedCustomer?.email,
  });

  const customerBookings: Booking[] = bookingsData?.bookings || [];

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleExportCSV = () => {
    if (customers.length === 0) return;

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Total Bookings",
      "Total Spent",
      "Last Active",
    ];
    const csvContent = [
      headers.join(","),
      ...customers.map((c: Customer) =>
        [
          c.name,
          c.email,
          c.phone || "-",
          c.totalBookings,
          c.totalSpent,
          c.lastBooking ? format(new Date(c.lastBooking), "yyyy-MM-dd") : "-",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "customers_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Customers</h1>
          <p className="text-gray-400">
            View and manage all customers who have booked with you.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to page 1 on search
              }}
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-turf-neon/50 focus:ring-1 focus:ring-turf-neon/20 w-full sm:w-64 transition-all"
            />
          </div>
          {/* Export Button */}
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-turf-neon gap-2"
          >
            <Download size={16} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Content */}
      <GlassCard className="p-0 overflow-visible" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Customer
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Contact
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
                  Bookings
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">
                  Total Spent
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">
                  Last Active
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-turf-neon"></div>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                customers.map((customer: Customer, idx: number) => (
                  <tr
                    key={idx}
                    onClick={() => handleCustomerClick(customer)}
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-turf-neon font-bold text-lg shadow-inner">
                          {customer.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-turf-neon transition-colors">
                            {customer.name || "Unknown User"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Mail size={14} />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Phone size={14} />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-turf-neon/10 text-turf-neon border border-turf-neon/20">
                        {customer.totalBookings}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-white font-medium font-mono">
                        ₹{Number(customer.totalSpent || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4 text-right text-gray-400 text-sm">
                      {customer.lastBooking
                        ? format(new Date(customer.lastBooking), "MMM d, yyyy")
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-white/10 bg-white/5 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Rows per page:</span>
            <Select
              value={String(itemsPerPage)}
              onValueChange={(val) => {
                setItemsPerPage(Number(val));
                setCurrentPage(1); // Reset to page 1 when items per page changes
              }}
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

      {/* Customer Details Sheet */}
      <Sheet
        open={!!selectedCustomer}
        onOpenChange={(open) => !open && setSelectedCustomer(null)}
      >
        <SheetContent className="w-full sm:max-w-md bg-turf-dark border-l border-white/10 text-white overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-turf-neon flex items-center justify-center text-black text-lg">
                {selectedCustomer?.name?.charAt(0).toUpperCase()}
              </div>
              {selectedCustomer?.name}
            </SheetTitle>
            <SheetDescription className="text-gray-400">
              Customer since{" "}
              {selectedCustomer?.lastBooking
                ? format(new Date(selectedCustomer.lastBooking), "yyyy")
                : "Recently"}
            </SheetDescription>
          </SheetHeader>

          {/* Customer Info Card */}
          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Contact Info
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Mail size={16} className="text-turf-neon" />
              {selectedCustomer?.email}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Phone size={16} className="text-turf-neon" />
              {selectedCustomer?.phone || "No phone provided"}
            </div>

            <div className="h-px bg-white/10 my-3" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Total Bookings</div>
                <div className="text-lg font-bold text-white">
                  {selectedCustomer?.totalBookings}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Total Spent</div>
                <div className="text-lg font-bold text-turf-neon">
                  ₹{Number(selectedCustomer?.totalSpent || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Booking History */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock size={18} className="text-turf-blue" />
              Booking History
            </h3>

            {bookingsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-turf-neon"></div>
              </div>
            ) : customerBookings.length > 0 ? (
              <div className="space-y-3">
                {customerBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white">
                        {booking.turfName}
                      </h4>
                      <Badge
                        className={`${booking.status === "confirmed" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"} border-0`}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {format(new Date(booking.date), "EEE, MMM d, yyyy")}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {format(
                          new Date(`2000-01-01T${booking.startTime}`),
                          "h:mm a"
                        )}{" "}
                        ({booking.duration}h)
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        ID: {booking.id.slice(0, 8)}...
                      </span>
                      <span className="font-bold text-turf-neon">
                        ₹{booking.totalPrice}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 bg-white/5 rounded-xl border border-white/5 border-dashed">
                No bookings found.
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
