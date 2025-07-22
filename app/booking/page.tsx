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
    <main className="min-h-screen bg-gray-50 ">
      <div className="p-5 flex bg-primary border-b items-center text-center shadow-md">
        <HomeIcon
          onClick={() => router.push("/")}
          className="text-white cursor-pointer"
        />
        <div className="font-bold text-2xl w-full text-white">
          Book Your Slots
        </div>
      </div>
      <div className=" max-w-4xl mx-auto px-4 py-6 flex flex-col gap-5">
        <div className="relative px-4 py-6 border rounded-lg bg-white shadow-md">
          <h2 className="text-center text-2xl font-bold mb-4">
            Select Your Turf
          </h2>
          <button
            className="absolute -left-6 top-1/2 -translate-y-1/2 z-10 bg-black shadow-md p-2 rounded-full"
            id="prevTurf"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            className="absolute -right-6 top-1/2 -translate-y-1/2 z-10 bg-black shadow-md p-2 rounded-full"
            id="nextTurf"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {turfLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading turfs...</p>
            </div>
          ) : (
            <Swiper
              modules={[Navigation]}
              spaceBetween={20}
              slidesPerView={1.5}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              navigation={{ nextEl: "#nextTurf", prevEl: "#prevTurf" }} // Custom navigation
            >
              {turfs.map((turf) => (
                <SwiperSlide key={turf.id}>
                  <Card className="shadow-md rounded-lg overflow-hidden">
                    <img
                      src={
                        turf.image_url || "/images/Carousel/Comp 1_00002.webp"
                      }
                      alt={turf.name}
                      className="w-full h-40 object-cover"
                    />
                    <CardContent className="p-4 text-center">
                      <CardTitle>{turf.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {turf.description}
                      </p>
                      <p className="text-lg font-semibold mt-2">
                        ₹{turf.price_per_hour} per hour
                      </p>

                      {turf.is_disabled ? (
                        <p className="text-red-500 text-sm mt-2">
                          {turf.disabled_reason}
                        </p>
                      ) : (
                        <Button
                          variant={turfId === turf.id ? "secondary" : "default"}
                          onClick={() => {
                            setStartTime("");
                            setTurfId(turf.id);
                            setSelectedTurf(turf);
                            setStep(2);
                          }}
                          className="mt-4 w-full"
                          disabled={turf.is_disabled}
                        >
                          {turfId === turf.id ? "Turf Selected" : "Select Turf"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        <div className="flex flex-col gap-5">
          {step >= 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent aria-disabled>
                <DateSelector
                  defauledDate={date ? new Date(date) : undefined}
                  disabledDates={getDisabledDates(blockedDates).disabledDates}
                  disabledRanges={getDisabledDates(blockedDates).disabledRanges}
                  maxDate={maxDate}
                  onDateSelect={(selectedDate) => {
                    setStartTime("");
                    if (selectedDate)
                      setDate(format(selectedDate, "yyyy-MM-dd"));

                    setStep(3);
                  }}
                />
              </CardContent>
            </Card>
          )}

          {step >= 3 && (
            <Card ref={timeSelectionRef}>
              <CardHeader>
                <CardTitle>Select Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {loading ? (
                    <p>Loading slots...</p>
                  ) : availableSlots.length > 0 ? (
                    availableSlots.map(({ time, isBooked, isBlocked }) => (
                      <DurationSelector
                        key={time}
                        startTime={time}
                        onTimeSelect={handleTimeSelect}
                        isDisabled={isBooked || isBlocked}
                        slotClassName={clsx(
                          "p-2 text-center cursor-pointer",
                          isBooked
                            ? "bg-red-500 text-white cursor-not-allowed"
                            : isBlocked
                              ? "bg-gray-500 text-white cursor-not-allowed"
                              : startTime === time
                                ? "bg-black text-white"
                                : " hover:bg-gray-200"
                        )}
                        buttonVariant={
                          isBooked || isBlocked ? "destructive" : "outline"
                        }
                        pricePerHour={calculateSlotPrice({
                          turf: selectedTurf!,
                          date: new Date(format(new Date(date), "yyyy-MM-dd")),
                          startTime: time,
                          peakHours: peakHours,
                        })}
                        minHours={parseInt(selectedTurf?.min_hours ?? "0")}
                        maxHours={parseInt(selectedTurf?.max_hours ?? "0")}
                      />
                    ))
                  ) : (
                    <p>No slots available.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
