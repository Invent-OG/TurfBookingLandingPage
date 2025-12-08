"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isBefore, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, HomeIcon } from "lucide-react";
import DateSelector from "@/components/date-picker";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import clsx from "clsx";
import { DurationSelector } from "@/components/booking/DurationSelector";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Navigation } from "swiper/modules";
import "swiper/css/navigation";
import { useTurfStore } from "@/lib/store/turf";
import { parse } from "path";
import { usePeakHourStore } from "@/lib/store/peakHours";
import { calculateSlotPrice } from "@/lib/calculateSlotPrice";

interface Slot {
  time: string;
  isBooked: boolean;
  isBlocked?: boolean;
}

type BlockedDate = {
  id: string;
  start_date: string;
  end_date?: string;
  reason: string;
};

export default function Booking() {
  const { turfs, setTurfs, selectedTurf, setSelectedTurf } = useTurfStore();

  const { setPeakHours, peakHours } = usePeakHourStore();

  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(
    null
  );

  const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null);

  const [step, setStep] = useState(1);

  // const [date, setDate] = useState("");

  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const [turfId, setTurfId] = useState(selectedTurf?.id);

  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);

  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);

  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);

  const [startTime, setStartTime] = useState("");

  const [loading, setLoading] = useState(false);

  const [turfLoading, setTurfLoading] = useState(false);

  const router = useRouter();

  const timeSelectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step === 3 && timeSelectionRef.current && !loading) {
      timeSelectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [step && !loading]);

  useEffect(() => {
    if (selectedTurf && selectedTurf.id) {
      setTurfId(selectedTurf.id);

      if (step < 2) setStep(2); // Ensure it shows date picker

      // If date is already selected (maybe from query param in future), go to step 3
      if (date && step < 3) setStep(3);
    }
  }, [selectedTurf]);

  useEffect(() => {
    if (!turfId || !date) return;

    const fetchData = async () => {
      setLoading(true);

      const formattedDate = format(date, "yyyy-MM-dd");
      const now = new Date();
      const localTime = now.toTimeString().split(" ")[0];

      try {
        const [slotsRes, blockedRes] = await Promise.all([
          fetch(
            `/api/bookings/slots?turfId=${turfId}&date=${formattedDate}&localTime=${localTime}&slotParam=${selectedTurf?.slot_interval}`
          ),
          fetch(`/api/block-time?turfId=${turfId}&date=${formattedDate}`),
        ]);

        const slotsData = await slotsRes.json();
        const blockedData = await blockedRes.json();

        setAvailableSlots(slotsData.availableSlots || []);
        setBlockedSlots(blockedData.blockedTimes || []);

        // ✅ Fetch peak hours directly from Supabase
        const { data: peakHours, error } = await supabase
          .from("turf_peak_hours")
          .select("*")
          .eq("turf_id", turfId);

        if (error) {
          console.error("Error fetching peak hours:", error);
          toast.error("Failed to fetch peak hours");
        } else {
          setPeakHours(peakHours || []);

          console.log(peakHours, "peak hours from supabase");
        }
      } catch (error) {
        toast.error("Error fetching data.");
        console.error("Fetch error:", error);
      }

      setLoading(false);
    };

    fetchData();
  }, [turfId, date]);

  useEffect(() => {
    if (!turfId) return;

    const fetchBlockedAndBookedDates = async () => {
      const { data: blockedData, error: blockedError } = await supabase
        .from("blocked_dates")
        .select("id, start_date, end_date, reason")
        .eq("turf_id", turfId)
        .is("blocked_times", null); // ✅ Fetch only dates with no blocked times

      if (blockedError) {
        console.error("Failed to fetch blocked dates:", blockedError.message);
        toast.error("Failed to load blocked dates.");
        return;
      }

      setBlockedDates(blockedData || []);
    };

    fetchBlockedAndBookedDates();

    console.log(blockedDates, "blocked dates");
  }, [turfId]);

  // ✅ Updated to handle both single blocked dates and blocked ranges

  const getDisabledDates = (
    blockedDates: { start_date: string; end_date?: string }[]
  ) => {
    const disabledDates: Date[] = [];
    const disabledRanges: { start: Date; end: Date }[] = [];

    blockedDates.forEach(({ start_date, end_date }) => {
      const startDate = parseISO(start_date);
      if (isBefore(startDate, new Date())) return; // Skip past dates

      if (end_date) {
        const endDate = parseISO(end_date);
        disabledRanges.push({ start: startDate, end: endDate });
      } else {
        disabledDates.push(startDate);
      }
    });

    return { disabledDates, disabledRanges };
  };

  const handleTimeSelect = (
    start: string,
    end: string,
    duration: number,
    amount: number
  ) => {
    setSelectedStartTime(start);
    setSelectedEndTime(end);

    console.log(start, end, duration, amount);

    if (!date || !selectedTurf?.name) {
      console.error("Date or Turf name is missing!");
      return;
    }

    router.push(
      `/booking/form?date=${encodeURIComponent(format(date, "yyyy-MM-dd"))}` +
        `&startTime=${encodeURIComponent(start)}` +
        `&endTime=${encodeURIComponent(end)}` +
        `&duration=${encodeURIComponent(duration)}` + // Added duration
        `&amount=${encodeURIComponent(amount)}` +
        `&court=${encodeURIComponent(selectedTurf.name)}` +
        `&turfId=${encodeURIComponent(selectedTurf.id)}`
    );
  };

  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2);

  return (
    <main className="min-h-screen bg-turf-dark text-white font-sans selection:bg-turf-neon/30">
      {/* Header */}
      <div className="sticky top-0 z-50 overflow-hidden border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-turf-neon/5 via-turf-blue/5 to-purple-500/5 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between relative z-10">
          <div
            className="flex items-center gap-3"
            onClick={() => router.push("/")}
            role="button"
          >
            <div className="p-2 rounded-full bg-white/5 border border-white/10 hover:border-turf-neon/50 transition-colors">
              <HomeIcon className="w-5 h-5 text-turf-neon" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Turf<span className="text-turf-neon">Book</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Turf Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Select Arena
            </h2>
            <div className="flex gap-2">
              <button
                className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-turf-neon/20 hover:text-turf-neon transition-all"
                id="prevTurf"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-turf-neon/20 hover:text-turf-neon transition-all"
                id="nextTurf"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {turfLoading ? (
            <div className="flex justify-center items-center h-60 w-full rounded-2xl bg-white/5 border border-white/10 animate-pulse">
              <p className="text-gray-400">Loading arenas...</p>
            </div>
          ) : (
            <Swiper
              modules={[Navigation]}
              spaceBetween={24}
              slidesPerView={1.2}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 2.5 },
              }}
              navigation={{ nextEl: "#nextTurf", prevEl: "#prevTurf" }}
              className="!overflow-visible"
            >
              {turfs.map((turf) => (
                <SwiperSlide key={turf.id} className="h-full">
                  <div
                    className={clsx(
                      "relative group rounded-2xl overflow-hidden border transition-all duration-300 h-full flex flex-col",
                      turfId === turf.id
                        ? "border-turf-neon shadow-[0_0_30px_-5px_rgba(204,255,0,0.3)] bg-black/40"
                        : "border-white/10 hover:border-white/30 bg-white/5"
                    )}
                  >
                    <div className="relative h-48 flex-shrink-0 overflow-hidden">
                      <img
                        src={
                          turf.image_url || "/images/Carousel/Comp 1_00002.webp"
                        }
                        alt={turf.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-1 uppercase font-heading italic">
                          {turf.name}
                        </h3>
                        <p className="text-sm text-gray-300 line-clamp-1">
                          {turf.location}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 space-y-4 flex flex-col flex-1">
                      <p className="text-sm text-gray-400 line-clamp-2 h-10">
                        {turf.description}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-auto">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                            Price
                          </p>
                          <p className="text-lg font-bold text-turf-neon">
                            ₹{turf.price_per_hour}
                            <span className="text-xs text-gray-400 font-normal">
                              /hr
                            </span>
                          </p>
                        </div>

                        {turf.is_disabled ? (
                          <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-500 text-xs font-bold">
                            UNAVAILABLE
                          </div>
                        ) : (
                          <Button
                            onClick={() => {
                              setStartTime("");
                              setTurfId(turf.id);
                              setSelectedTurf(turf);
                              setStep(2);
                            }}
                            className={clsx(
                              "rounded-lg font-bold px-6 transition-all",
                              turfId === turf.id
                                ? "bg-turf-neon text-black hover:bg-turf-neon/90"
                                : "bg-white/10 hover:bg-white/20 text-white"
                            )}
                          >
                            {turfId === turf.id ? "Selected" : "Select"}
                          </Button>
                        )}
                      </div>

                      {turf.is_disabled && (
                        <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20 text-center">
                          {turf.disabled_reason}
                        </p>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {/* Date Selection */}
        {step >= 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-turf-blue/20 text-turf-blue text-sm border border-turf-blue/30">
                  2
                </span>
                Select Date
              </h2>
              <DateSelector
                defauledDate={date ? new Date(date) : undefined}
                disabledDates={getDisabledDates(blockedDates).disabledDates}
                disabledRanges={getDisabledDates(blockedDates).disabledRanges}
                maxDate={maxDate}
                onDateSelect={(selectedDate) => {
                  setStartTime("");
                  if (selectedDate) setDate(format(selectedDate, "yyyy-MM-dd"));
                  setStep(3);
                }}
              />
            </div>
          </div>
        )}

        {/* Time Selection */}
        {step >= 3 && (
          <div
            ref={timeSelectionRef}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-turf-neon/20 text-turf-neon text-sm border border-turf-neon/30">
                  3
                </span>
                Select Time Slot
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {loading ? (
                  Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-12 rounded-lg bg-white/5 animate-pulse"
                    />
                  ))
                ) : availableSlots.length > 0 ? (
                  availableSlots.map(({ time, isBooked, isBlocked }) => (
                    <DurationSelector
                      key={time}
                      startTime={time}
                      onTimeSelect={handleTimeSelect}
                      isDisabled={isBooked || isBlocked}
                      minHours={parseInt(selectedTurf?.min_hours ?? "0")}
                      maxHours={parseInt(selectedTurf?.max_hours ?? "0")}
                      slotClassName={clsx(
                        "w-full py-3 px-2 rounded-xl text-sm font-medium border transition-all duration-200",
                        isBooked
                          ? "bg-red-500/10 border-red-500/20 text-red-500 cursor-not-allowed opacity-60"
                          : isBlocked
                            ? "bg-gray-800/50 border-white/5 text-gray-500 cursor-not-allowed"
                            : startTime === time
                              ? "bg-turf-neon text-black border-turf-neon shadow-[0_0_15px_-3px_rgba(204,255,0,0.4)] scale-105"
                              : "bg-black/40 border-white/10 text-gray-300 hover:border-turf-neon/50 hover:text-white hover:bg-white/5"
                      )}
                      buttonVariant="ghost"
                      pricePerHour={calculateSlotPrice({
                        turf: selectedTurf!,
                        date: new Date(format(new Date(date), "yyyy-MM-dd")),
                        startTime: time,
                        peakHours: peakHours,
                      })}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
                      <span className="text-2xl">😕</span>
                    </div>
                    <p className="text-gray-400">
                      No slots available for this date.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
