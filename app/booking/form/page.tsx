"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parse } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const bookingFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

function BookingFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const date = searchParams.get("date");
  const startTime = searchParams.get("startTime");
  const endTime = searchParams.get("endTime");
  const duration = searchParams.get("duration"); // ✅ Added duration
  const amount = searchParams.get("amount");
  const court = searchParams.get("court");
  const turfId = searchParams.get("turfId");

  useEffect(() => {
    if (!date || !startTime || !endTime || !duration || !amount || !turfId) {
      router.push("/");
    }
  }, [date, startTime, endTime, duration, amount, turfId, router]);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
    },
  });

  const formatSlotTime = (time: string) => {
    const parsedTime = parse(time, "HH:mm:ss", new Date());
    return format(parsedTime, "hh:mm a");
  };

  const fetchAvailableSlots = async () => {
    const now = new Date();
    const localTime = now.toTimeString().split(" ")[0]; // Get HH:mm:ss format

    const response = await fetch(
      `/api/bookings/slots?turfId=${turfId}&date=${date}&localTime=${localTime}`
    );
    const data = await response.json();
    return data.availableSlots;
  };

  useEffect(() => {
    if (typeof window !== "undefined" && !window.Cashfree) {
      const script = document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;

      script.onload = () => {
        console.log("✅ Cashfree SDK Loaded");
        setCashfreeLoaded(true);
      };

      script.onerror = () => {
        console.error("❌ Cashfree SDK Failed to Load");
        setCashfreeLoaded(false);
      };

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    } else if (window.Cashfree) {
      setCashfreeLoaded(true);
    }
  }, []);

  const handleBookingSubmit = async (formData: BookingFormValues) => {
    setLoading(true);
    if (!cashfreeLoaded || typeof window.Cashfree === "undefined") {
      toast.error("Cashfree SDK is not loaded! Please try again.");
      setLoading(false);
      return;
    }

    try {
      const availableSlots = await fetchAvailableSlots();
      const selectedSlot = availableSlots?.find((slot: any) =>
        slot.time.startsWith(startTime)
      );

      if (!selectedSlot || selectedSlot.isBooked || selectedSlot.isBlocked) {
        toast.error(
          "Selected time slot is already booked or unavailable. Please choose another."
        );
        setLoading(false);
        return;
      }

      const bookingDetails = {
        turfId,
        turfName: court,
        date,
        startTime,
        duration: parseInt(duration ?? "1", 10),
        totalPrice: parseFloat(amount ?? "0"),
        paymentMethod: "online",
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
      };

      const responseBooking = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingDetails),
      });

      if (!responseBooking.ok) {
        const errorData = await responseBooking.json();
        throw new Error(errorData.error);
      }

      const bookingData = await responseBooking.json();
      console.log("Booking Data:", bookingData.bookingId);

      console.log("🔄 Fetching Payment Session...");
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: bookingData.bookingId,
          order_amount: parseFloat(amount ?? "0"),
          customer_email: formData.email,
          customer_phone: formData.phone,
          customer_name: formData.fullName,
        }),
      });

      if (!response.ok) throw new Error("❌ Failed to fetch payment session");

      const data = await response.json();
      console.log("✅ Payment Session Data:", data);

      if (!data.paymentSessionId)
        throw new Error("❌ Invalid payment session ID");

      const cashfree = new window.Cashfree({ mode: "sandbox" }); // or "sandbox" ,production

      cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (error) {
      console.log("Booking failed:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Booking failed! Please try again.");
      } else {
        toast.error("Booking failed! Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-turf-dark px-4 py-12 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-turf-neon/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-turf-blue/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Complete Booking
          </h1>
          <p className="text-gray-400">
            Almost there! Just need a few details to confirm.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6 md:p-8 space-y-8">
          {/* Summary Card */}
          <div className="p-5 bg-black/40 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Booking Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-turf-neon" />
                  Date
                </span>
                <span className="text-white font-medium">{date}</span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-turf-blue" />
                  Time
                </span>
                <span className="text-white font-medium">
                  {startTime ? formatSlotTime(startTime) : "Invalid Time"}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Duration
                </span>
                <span className="text-white font-medium">{duration} hours</span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  Arena
                </span>
                <span className="text-white font-medium">{court}</span>
              </div>

              <div className="h-px bg-white/10 my-3" />

              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Total Amount</span>
                <span className="text-2xl font-bold text-turf-neon">
                  ₹{amount}
                </span>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleBookingSubmit)}
              className="space-y-5"
              noValidate
            >
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-gray-300">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. John Doe"
                        {...field}
                        disabled={loading}
                        className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-turf-neon/50 focus:ring-1 focus:ring-turf-neon/20 rounded-xl h-11"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-gray-300">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. john@example.com"
                        type="email"
                        {...field}
                        disabled={loading}
                        className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-turf-neon/50 focus:ring-1 focus:ring-turf-neon/20 rounded-xl h-11"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-gray-300">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 9876543210"
                        type="tel"
                        {...field}
                        disabled={loading}
                        className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-turf-neon/50 focus:ring-1 focus:ring-turf-neon/20 rounded-xl h-11"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <div className="pt-4 space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-turf-neon text-black font-bold h-12 rounded-xl hover:bg-turf-neon/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Processing Payment...
                    </span>
                  ) : (
                    "Proceed to Payment"
                  )}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white hover:bg-white/5"
                  onClick={() => router.push("/")}
                  disabled={loading}
                  type="button"
                >
                  Cancel Booking
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default function BookingFormPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingFormContent />
    </Suspense>
  );
}
