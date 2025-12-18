// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Drawer,
//   DrawerContent,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerDescription,
// } from "@/components/ui/drawer";
// import { format, parse } from "date-fns";

// import { Plus, Minus } from "lucide-react";
// import { Card } from "../ui/card";

// interface DurationSelectorProps {
//   startTime: string;
//   onTimeSelect: (start: string, end: string) => void;
//   isDisabled: boolean | undefined;
//   slotClassName: string;
//   pricePerHour: number;
// }

// export function DurationSelector({
//   startTime,
//   onTimeSelect,
//   isDisabled = false,
//   slotClassName,
//   pricePerHour,
// }: DurationSelectorProps) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [duration, setDuration] = useState(1);
//   const maxDuration = 3; // Maximum 3 hours
//   const minDuration = 1; // Minimum 30 minutes

//   const calculateEndTime = (start: string, durationHours: number) => {
//     const [time, period] = start.split(" ");
//     const [hours, minutes] = time.split(":").map(Number);
//     const totalMinutes = hours * 60 + minutes + durationHours * 60;
//     let endHours = Math.floor(totalMinutes / 60);
//     const endMinutes = totalMinutes % 60;
//     let endPeriod = period;

//     if (endHours >= 12) {
//       if (endHours > 12) endHours -= 12;
//       endPeriod = "PM";
//     }
//     if (endHours === 0) endHours = 12;

//     return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(
//       2,
//       "0"
//     )} ${endPeriod}`;
//   };

//   const handleDurationChange = (change: number) => {
//     const newDuration = Math.min(
//       Math.max(duration + change, minDuration),
//       maxDuration
//     );
//     setDuration(newDuration);
//   };

//   const handleConfirm = () => {
//     const endTime = calculateEndTime(startTime, duration);
//     onTimeSelect(startTime, endTime);
//     setIsOpen(false);
//   };

//   const calculatePrice = (hours: number) => {
//     return Math.round(hours * pricePerHour); // ₹1000 per hour
//   };

//   // Function to format slot time properly
//   const formatSlotTime = (time: string) => {
//     const parsedTime = parse(time, "HH:mm:ss", new Date());
//     return format(parsedTime, "hh:mm a"); // Converts to 12-hour format with AM/PM
//   };

//   return (
//     <>
//       <Card
//         onClick={() => setIsOpen(true)}
//         className={slotClassName}
//         aria-disabled={isDisabled}
//       >
//         {formatSlotTime(startTime)}
//       </Card>

//       <Drawer open={isOpen} onOpenChange={setIsOpen}>
//         <DrawerContent>
//           <DrawerHeader>
//             <DrawerTitle>Select Duration</DrawerTitle>
//             <DrawerDescription>
//               Starting from {formatSlotTime(startTime)}
//             </DrawerDescription>
//           </DrawerHeader>
//           <div className="p-4">
//             <div className="space-y-6">
//               <div className="flex items-center justify-center space-x-4">
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   onClick={() => handleDurationChange(-1)}
//                   disabled={duration <= minDuration}
//                 >
//                   <Minus className="h-4 w-4" />
//                 </Button>
//                 <div className="text-center">
//                   <div className="text-2xl font-bold">{duration} hr</div>
//                   <div className="text-sm text-muted-foreground">
//                     {formatSlotTime(startTime)} -{" "}
//                     {calculateEndTime(formatSlotTime(startTime), duration)}
//                   </div>
//                 </div>
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   onClick={() => handleDurationChange(1)}
//                   disabled={duration >= maxDuration}
//                 >
//                   <Plus className="h-4 w-4" />
//                 </Button>
//               </div>

//               <div className="text-center">
//                 <div className="text-sm text-muted-foreground">
//                   Total Amount
//                 </div>
//                 <div className="text-2xl font-bold">
//                   ₹{calculatePrice(duration)}
//                 </div>
//               </div>

//               <Button className="w-full" onClick={handleConfirm}>
//                 Confirm Booking
//               </Button>
//             </div>
//           </div>
//         </DrawerContent>
//       </Drawer>
//     </>
//   );
// }

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { format, parse } from "date-fns";

import { Plus, Minus } from "lucide-react";
import { Card } from "../ui/card";
import { max } from "drizzle-orm";

interface DurationSelectorProps {
  startTime: string;
  onTimeSelect: (
    start: string,
    end: string,
    duration: number,
    amount: number
  ) => void;
  isDisabled: boolean | undefined;
  slotClassName?: string;
  pricePerHour: number;
  buttonVariant:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null
    | undefined;
  minHours: number;
  maxHours: number;
  isPeak?: boolean;
  calculateTotalPrice?: (duration: number) => number;
}

export function DurationSelector({
  startTime,
  onTimeSelect,
  isDisabled = false,
  slotClassName,
  pricePerHour,
  buttonVariant,
  minHours,
  maxHours,
  isPeak = false,
  calculateTotalPrice,
}: DurationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [duration, setDuration] = useState(1);
  const maxDuration = maxHours; // Maximum 3 hours
  const minDuration = minHours; // Minimum 1 hour

  const calculateEndTime = (start: string, durationHours: number) => {
    const [time, period] = start.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationHours * 60;
    let endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    let endPeriod = period;

    if (endHours >= 12) {
      if (endHours > 12) endHours -= 12;
      endPeriod = "PM";
    }
    if (endHours === 0) endHours = 12;

    return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(
      2,
      "0"
    )} ${endPeriod}`;
  };

  const handleDurationChange = (change: number) => {
    const newDuration = Math.min(
      Math.max(duration + change, minDuration),
      maxDuration
    );
    setDuration(newDuration);
  };

  const handleConfirm = () => {
    const endTime = calculateEndTime(startTime, duration);
    const totalAmount = calculatePrice(duration);
    onTimeSelect(startTime, endTime, duration, totalAmount);
    setIsOpen(false);
  };

  const calculatePrice = (hours: number) => {
    if (calculateTotalPrice) {
      return calculateTotalPrice(hours);
    }
    return Math.round(hours * pricePerHour);
  };

  const formatSlotTime = (time: string) => {
    const parsedTime = parse(time, "HH:mm:ss", new Date());
    return format(parsedTime, "hh:mm a");
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={slotClassName}
        disabled={isDisabled}
        variant={buttonVariant}
      >
        <div className="flex flex-col items-center justify-center skew-x-[10deg]">
          <span>{formatSlotTime(startTime)}</span>
          {isPeak && !isDisabled && (
            <div className="flex flex-col items-center mt-1 leading-none">
              <span className="text-[9px] text-turf-neon/70 font-bold uppercase tracking-widest mb-0.5">
                Peak Price
              </span>
              <span className="text-xs text-turf-neon font-black">
                ₹{pricePerHour}
              </span>
            </div>
          )}
        </div>
      </Button>

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="bg-black/90 border-t border-white/10 text-white backdrop-blur-xl">
          <DrawerHeader>
            <DrawerTitle className="text-3xl font-black italic uppercase font-heading text-white">
              Select Duration
            </DrawerTitle>
            <DrawerDescription className="text-gray-400 font-medium uppercase tracking-wider text-xs">
              Starting from {formatSlotTime(startTime)}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-6 max-w-md mx-auto w-full">
            <div className="space-y-8">
              <div className="flex items-center justify-center space-x-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDurationChange(-1)}
                  disabled={duration <= minDuration}
                  className="w-12 h-12 rounded-none skew-x-[-10deg] bg-white/5 border border-white/10 text-white hover:bg-turf-neon hover:text-black hover:border-turf-neon disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <Minus className="h-5 w-5 skew-x-[10deg]" />
                </Button>
                <div className="text-center min-w-[120px]">
                  <div className="text-4xl font-black italic font-heading text-white">
                    {duration} <span className="text-lg text-gray-500">hr</span>
                  </div>
                  <div className="text-xs text-turf-neon uppercase tracking-widest font-bold mt-1">
                    {formatSlotTime(startTime)} -{" "}
                    {calculateEndTime(formatSlotTime(startTime), duration)}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDurationChange(1)}
                  disabled={duration >= maxDuration}
                  className="w-12 h-12 rounded-none skew-x-[-10deg] bg-white/5 border border-white/10 text-white hover:bg-turf-neon hover:text-black hover:border-turf-neon disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <Plus className="h-5 w-5 skew-x-[10deg]" />
                </Button>
              </div>

              <div className="text-center bg-white/5 p-4 border border-white/10 skew-x-[-10deg]">
                <div className="skew-x-[10deg]">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">
                    Total Amount
                  </div>
                  <div className="text-4xl font-black text-turf-neon italic font-heading">
                    ₹{calculatePrice(duration)}
                  </div>
                </div>
              </div>

              <Button
                className="w-full h-14 bg-turf-neon text-black font-black uppercase text-lg hover:bg-turf-neon/90 rounded-none skew-x-[-10deg] shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all hover:scale-[1.02]"
                onClick={handleConfirm}
              >
                <span className="skew-x-[10deg]">Confirm Booking</span>
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
