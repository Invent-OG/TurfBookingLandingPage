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
      const isAvailable = await fetchAvailableSlots();
      if (!isAvailable) {
        toast.error(
          "Selected time slot is already booked. Please choose another."
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
    <div className="flex lg:items-center h-screen lg:justify-center lg:bg-gray-100">
      <div className="max-w-lg mx-auto lg:rounded-xl lg:shadow-md bg-white lg:p-10 p-6 lg:border space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Complete Your Booking</h1>
          <p className="text-gray-600">
            Please provide your details to confirm the booking.
          </p>
        </div>
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-3">Booking Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span>{date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Time</span>
              <span>
                {startTime ? formatSlotTime(startTime) : "Invalid Time"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Duration</span>
              <span>{duration} hours</span> {/* ✅ Added Duration */}
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Court</span>
              <span>{court}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span>₹{amount}</span>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleBookingSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john@example.com"
                      type="email"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1234567890"
                      type="tel"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : "Proceed to payment"}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/")}
              disabled={loading}
            >
              Back
            </Button>
          </form>
        </Form>
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
