"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isBefore, parseISO } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, HomeIcon } from "lucide-react";
import DateSelector from "@/components/date-picker";
import { toast } from "sonner";
import clsx from "clsx";
import { DurationSelector } from "@/components/booking/DurationSelector";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Navigation } from "swiper/modules";
import "swiper/css/navigation";
import { useTurfs } from "@/hooks/use-turfs";
import { useSlots, useBlockedTimes, Slot } from "@/hooks/use-slots";
import { useBlockedDates } from "@/hooks/use-blocked-dates";
import { usePeakHours } from "@/hooks/use-peak-hours";
import { usePeakHourStore } from "@/lib/store/peakHours";
import { calculateSlotPrice } from "@/lib/calculateSlotPrice";

function BookingContent() {
  const { data: turfs = [], isLoading: turfLoading } = useTurfs();
  const searchParams = useSearchParams();
  const turfIdParam = searchParams.get("turfId");
  const [selectedTurfId, setSelectedTurfId] = useState<string | null>(
    turfIdParam
  );

  // Update selectedTurfId if URL changes (optional, but good for back navigation)
  useEffect(() => {
    if (turfIdParam) setSelectedTurfId(turfIdParam);
  }, [turfIdParam]);

  // Derived selectedTurf from turfs list
  const selectedTurf = turfs.find((t) => t.id === selectedTurfId) || null;

  const { data: peakHours = [] } = usePeakHours(selectedTurfId || undefined);

  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(
    null
  );

  const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null);

  const [step, setStep] = useState(1);

  // const [date, setDate] = useState("");

  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Sync state with selectedTurfId
  // const [turfId, setTurfId] = useState(selectedTurf?.id); // Removed redundant state

  const {
    data: availableSlots = [],
    isLoading: slotsLoading,
    isFetching: slotsFetching,
  } = useSlots(selectedTurfId || undefined, date ? new Date(date) : null);
  const { data: blockedSlots = [] } = useBlockedTimes(
    selectedTurfId || undefined,
    date ? new Date(date) : null
  );
  const { data: blockedDates = [] } = useBlockedDates(
    selectedTurfId || undefined
  );

  const [startTime, setStartTime] = useState("");

  const loading = slotsLoading || slotsFetching; // Use hook loading state

  // const [turfLoading, setTurfLoading] = useState(false); // Handled by hook

  const router = useRouter();

  const timeSelectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step === 3 && timeSelectionRef.current && !loading) {
      timeSelectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [step && !loading]);

  useEffect(() => {
    if (selectedTurfId) {
      if (step < 2) setStep(2); // Ensure it shows date picker

      // If date is already selected (maybe from query param in future), go to step 3
      if (date && step < 3) setStep(3);
    }
  }, [selectedTurfId]);

  // Removed manual fetching effects as hooks handle it

  // ✅ Updated to handle both single blocked dates and blocked ranges

  const getDisabledDates = (
    blockedDates: { startDate: string; endDate?: string | null }[]
  ) => {
    const disabledDates: Date[] = [];
    const disabledRanges: { start: Date; end: Date }[] = [];

    blockedDates.forEach((d) => {
      if (!d.startDate) return;
      const startDate = parseISO(d.startDate);

      if (isBefore(startDate, new Date())) return; // Skip past dates

      if (d.endDate) {
        const endDate = parseISO(d.endDate);
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
        <div className="absolute inset-0 bg-gradient-to-r from-turf-neon/5 via-white/5 to-purple-500/5 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between relative z-10">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => router.push("/")}
            role="button"
          >
            <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-turf-neon/50 transition-colors">
              <HomeIcon className="w-5 h-5 text-turf-neon" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white font-heading italic uppercase">
              Turf<span className="text-turf-neon">Book</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-12">
        {/* Turf Selection */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black text-white font-heading italic uppercase transform -skew-x-6">
              Select{" "}
              <span className="text-stroke-neon text-transparent">Arena</span>
            </h2>
            <div className="flex gap-2">
              <button
                className="p-3 rounded-none skew-x-[-10deg] bg-white/5 border border-white/10 hover:bg-turf-neon hover:text-black transition-all"
                id="prevTurf"
              >
                <ChevronLeft className="w-6 h-6 skew-x-[10deg]" />
              </button>
              <button
                className="p-3 rounded-none skew-x-[-10deg] bg-white/5 border border-white/10 hover:bg-turf-neon hover:text-black transition-all"
                id="nextTurf"
              >
                <ChevronRight className="w-6 h-6 skew-x-[10deg]" />
              </button>
            </div>
          </div>

          {turfLoading ? (
            <div className="flex justify-center items-center h-60 w-full bg-white/5 border border-white/10 animate-pulse">
              <div className="text-turf-neon font-bold uppercase tracking-widest">
                Loading arenas...
              </div>
            </div>
          ) : (
            <Swiper
              modules={[Navigation]}
              spaceBetween={24}
              slidesPerView={1.2}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              navigation={{ nextEl: "#nextTurf", prevEl: "#prevTurf" }}
              className="!overflow-visible py-4"
            >
              {turfs.map((turf) => (
                <SwiperSlide key={turf.id} className="h-full">
                  <div
                    className={clsx(
                      "relative group overflow-hidden border-2 transition-all duration-300 h-full flex flex-col",
                      selectedTurfId === turf.id
                        ? "border-turf-neon shadow-[0_0_30px_-5px_rgba(204,255,0,0.3)] bg-black/80 scale-[1.02]"
                        : "border-white/10 hover:border-turf-neon/50 bg-black/40 hover:bg-black/60"
                    )}
                  >
                    {selectedTurfId === turf.id && (
                      <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-r-[40px] border-t-turf-neon border-r-transparent z-20"></div>
                    )}

                    <div className="relative h-48 flex-shrink-0 overflow-hidden">
                      <img
                        src={
                          turf.imageUrl || "/images/Carousel/Comp 1_00002.webp"
                        }
                        alt={turf.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                      <div className="absolute bottom-4 left-4 right-4 z-10">
                        <h3 className="text-2xl font-black text-white mb-1 uppercase font-heading italic leading-none drop-shadow-lg">
                          {turf.name}
                        </h3>
                        <p className="text-sm text-gray-300 line-clamp-1 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-turf-neon rounded-full"></span>
                          {turf.location}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 space-y-4 flex flex-col flex-1 relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none opacity-50"></div>

                      <p className="text-sm text-gray-400 line-clamp-2 h-10 font-medium leading-relaxed">
                        {turf.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto relative z-10">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                            Price / Hour
                          </p>
                          <p className="text-xl font-black text-white italic">
                            ₹{turf.pricePerHour}
                          </p>
                        </div>

                        {turf.isDisabled ? (
                          <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-500 text-xs font-black uppercase tracking-wider skew-x-[-10deg]">
                            Unavailable
                          </div>
                        ) : (
                          <Button
                            onClick={() => {
                              setStartTime("");
                              setSelectedTurfId(turf.id);
                              setStep(2);
                            }}
                            className={clsx(
                              "rounded-none font-black px-8 transition-all skew-x-[-10deg] uppercase tracking-wider",
                              selectedTurfId === turf.id
                                ? "bg-turf-neon text-black hover:bg-turf-neon/90 shadow-lg shadow-neon-green/20"
                                : "bg-white/10 hover:bg-white/20 text-white"
                            )}
                          >
                            <span className="skew-x-[10deg]">
                              {selectedTurfId === turf.id
                                ? "Selected"
                                : "Select"}
                            </span>
                          </Button>
                        )}
                      </div>

                      {turf.isDisabled && (
                        <p className="text-xs text-red-400 bg-red-500/10 p-2 border border-red-500/20 text-center font-bold uppercase">
                          {turf.disabledReason}
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
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-turf-neon via-white/20 to-transparent"></div>

              <div className="pl-6">
                <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4 font-heading italic uppercase">
                  <span className="flex items-center justify-center w-10 h-10 bg-turf-neon text-black text-lg skew-x-[-10deg] shadow-neon font-sans not-italic font-bold">
                    2
                  </span>
                  Select Date
                </h2>

                <div className="p-8 border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl">
                  <DateSelector
                    defauledDate={date ? new Date(date) : undefined}
                    disabledDates={getDisabledDates(blockedDates).disabledDates}
                    disabledRanges={
                      getDisabledDates(blockedDates).disabledRanges
                    }
                    maxDate={maxDate}
                    onDateSelect={(selectedDate) => {
                      setStartTime("");
                      if (selectedDate)
                        setDate(format(selectedDate, "yyyy-MM-dd"));
                      setStep(3);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Time Selection */}
        {step >= 3 && (
          <div
            ref={timeSelectionRef}
            className="animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20"
          >
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-turf-neon via-white/20 to-transparent"></div>

              <div className="pl-6">
                <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4 font-heading italic uppercase">
                  <span className="flex items-center justify-center w-10 h-10 bg-turf-neon text-black text-lg skew-x-[-10deg] shadow-neon font-sans not-italic font-bold">
                    3
                  </span>
                  Select Time Slot
                </h2>

                <div className="p-8 border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {loading ? (
                      Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-14 bg-white/5 animate-pulse"
                        />
                      ))
                    ) : availableSlots.length > 0 ? (
                      availableSlots.map(({ time, isBooked, isBlocked }) => (
                        <DurationSelector
                          key={time}
                          startTime={time}
                          onTimeSelect={handleTimeSelect}
                          isDisabled={isBooked || isBlocked}
                          minHours={parseInt(
                            String(selectedTurf?.minHours ?? "0")
                          )}
                          maxHours={parseInt(
                            String(selectedTurf?.maxHours ?? "0")
                          )}
                          slotClassName={clsx(
                            "w-full py-4 px-2 text-sm font-bold border transition-all duration-200 uppercase tracking-wide skew-x-[-10deg] rounded-none",
                            isBooked
                              ? "bg-red-900/10 border-red-500/20 text-red-500 cursor-not-allowed opacity-50"
                              : isBlocked
                                ? "bg-gray-800/50 border-white/5 text-gray-600 cursor-not-allowed"
                                : startTime === time
                                  ? "bg-turf-neon text-black border-turf-neon shadow-[0_0_20px_rgba(204,255,0,0.4)] scale-105 z-10"
                                  : "bg-black/40 border-white/10 text-gray-400 hover:border-turf-neon hover:text-white hover:bg-white/5"
                          )}
                          buttonVariant="ghost"
                          pricePerHour={calculateSlotPrice({
                            turf: selectedTurf!,
                            date: new Date(
                              format(new Date(date), "yyyy-MM-dd")
                            ),
                            startTime: time,
                            peakHours: peakHours,
                          })}
                        />
                      ))
                    ) : (
                      <div className="col-span-full py-16 text-center border-2 border-dashed border-white/10">
                        <div className="w-16 h-16 bg-white/5 mx-auto flex items-center justify-center mb-4">
                          <span className="text-3xl text-gray-500">:(</span>
                        </div>
                        <h3 className="text-xl font-bold text-white uppercase italic">
                          No Slots Available
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                          Try selecting a different date.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function Booking() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen w-full bg-turf-dark">
          <div className="inline-block w-12 h-12 border-4 border-turf-neon border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
