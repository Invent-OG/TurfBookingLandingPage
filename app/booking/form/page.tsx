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
    <div className="flex items-center justify-center min-h-screen bg-turf-dark px-4 py-12 relative overflow-hidden font-sans selection:bg-turf-neon/30">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-turf-neon/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-10">
          <div className="inline-block transform -skew-x-6">
            <h1 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase font-heading italic">
              Complete <span className="text-turf-neon">Booking</span>
            </h1>
          </div>
          <p className="text-gray-400 font-medium">
            Almost there! Just need a few details to confirm.
          </p>
        </div>

        <div className="relative">
          {/* Decorative Border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-turf-neon/50 to-white/20 blur opacity-50 rounded-2xl"></div>

          <div className="relative rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl p-0 overflow-hidden">
            {/* Ticket Top Section */}
            <div className="p-8 pb-10 bg-white/5 relative border-b-2 border-dashed border-white/10">
              {/* Cutout Circles */}
              <div className="absolute -left-3 bottom-[-12px] w-6 h-6 rounded-full bg-turf-dark border border-white/10 z-10"></div>
              <div className="absolute -right-3 bottom-[-12px] w-6 h-6 rounded-full bg-turf-dark border border-white/10 z-10"></div>

              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-6 text-center">
                Match Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-turf-neon uppercase font-bold tracking-wider mb-1">
                      Date
                    </p>
                    <p className="text-white font-bold text-lg">{date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-turf-neon uppercase font-bold tracking-wider mb-1">
                      Time
                    </p>
                    <p className="text-white font-bold text-lg">
                      {startTime ? formatSlotTime(startTime) : "Invalid"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-turf-neon uppercase font-bold tracking-wider mb-1">
                      Duration
                    </p>
                    <p className="text-white font-bold text-lg">
                      {duration} Hr
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-turf-neon uppercase font-bold tracking-wider mb-1">
                      Arena
                    </p>
                    <p className="text-white font-bold text-lg uppercase">
                      {court}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Section */}
            <div className="px-8 py-6 bg-turf-neon/10 flex items-center justify-between border-b border-white/5">
              <span className="text-gray-400 font-black uppercase tracking-wider text-sm">
                Total Amount
              </span>
              <span className="text-3xl font-black text-white italic tracking-tighter">
                ₹{amount}
              </span>
            </div>

            {/* Form Section */}
            <div className="p-8 pt-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleBookingSubmit)}
                  className="space-y-6"
                  noValidate
                >
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="JOHN DOE"
                            {...field}
                            disabled={loading}
                            className="bg-black/50 border-2 border-white/10 text-white placeholder-gray-600 focus:border-turf-neon focus:ring-0 rounded-none h-12 font-bold uppercase"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400 font-medium" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="JOHN@EXAMPLE.COM"
                            type="email"
                            {...field}
                            disabled={loading}
                            className="bg-black/50 border-2 border-white/10 text-white placeholder-gray-600 focus:border-turf-neon focus:ring-0 rounded-none h-12 font-bold uppercase"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400 font-medium" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="9876543210"
                            type="tel"
                            {...field}
                            disabled={loading}
                            className="bg-black/50 border-2 border-white/10 text-white placeholder-gray-600 focus:border-turf-neon focus:ring-0 rounded-none h-12 font-bold uppercase text-lg tracking-widest"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400 font-medium" />
                      </FormItem>
                    )}
                  />

                  <div className="pt-6 space-y-3">
                    <Button
                      type="submit"
                      className="w-full bg-turf-neon text-black font-black h-14 rounded-none skew-x-[-10deg] hover:bg-turf-neon/90 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-lg shadow-lg shadow-neon-green/30"
                      disabled={loading}
                    >
                      <span className="skew-x-[10deg] flex items-center gap-2">
                        {loading ? (
                          <>
                            <span className="w-5 h-5 border-4 border-black/30 border-t-black rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Proceed to Payment"
                        )}
                      </span>
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full text-gray-500 hover:text-white hover:bg-transparent font-bold uppercase tracking-widest text-xs"
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
