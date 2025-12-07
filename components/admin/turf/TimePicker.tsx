// // import { useState } from "react";
// // import { format, addMinutes, isBefore, parse, isAfter } from "date-fns";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";

// // const generateTimeSlots = (start: string, interval: number): string[] => {
// //   const slots: string[] = [];
// //   let current = parse(start, "hh:mm a", new Date());
// //   const endTime = parse("11:59 PM", "hh:mm a", new Date());

// //   while (isBefore(current, addMinutes(endTime, 1))) {
// //     const formattedTime = format(current, "hh:mm a");
// //     slots.push(formattedTime);
// //     current = addMinutes(current, interval);
// //   }

// //   return slots;
// // };

// // export function TimePicker({
// //   interval,
// //   startTime,
// //   defaultValue,
// //   onChange,
// //   validate,
// // }: {
// //   interval: number;
// //   startTime?: string;
// //   defaultValue?: string;
// //   onChange: (e: { target: { value: string } }) => void;
// //   validate?: (value: string) => boolean;
// // }) {
// //   const timeSlots = generateTimeSlots(startTime || "12:00 AM", interval);
// //   const validDefaultValue = timeSlots.includes(defaultValue || "")
// //     ? defaultValue
// //     : timeSlots[0];
// //   const [selectedTime, setSelectedTime] = useState<string>(
// //     validDefaultValue || ""
// //   );
// //   const [error, setError] = useState<string>("");

// //   const handleTimeChange = (time: string) => {
// //     if (validate && !validate(time)) {
// //       setError("Invalid time selection");
// //       return;
// //     }
// //     setError("");
// //     setSelectedTime(time);
// //     onChange({ target: { value: time } });
// //   };

// //   return (
// //     <div className="flex flex-col items-center">
// //       <Select onValueChange={handleTimeChange} value={selectedTime}>
// //         <SelectTrigger className="w-[200px]">
// //           <SelectValue placeholder="Select Time" />
// //         </SelectTrigger>
// //         <SelectContent>
// //           {timeSlots.map((time, index) => (
// //             <SelectItem key={index} value={time}>
// //               {time}
// //             </SelectItem>
// //           ))}
// //         </SelectContent>
// //       </Select>
// //       {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
// //     </div>
// //   );
// // }

// import { useState } from "react";
// import { format, addMinutes, isBefore, parse, isAfter } from "date-fns";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// const generateTimeSlots = (start: string, interval: number): string[] => {
//   const slots: Set<string> = new Set();
//   let current = parse(start, "HH:mm:ss", new Date());
//   const endTime = parse("23:59:59", "HH:mm:ss", new Date());

//   while (isBefore(current, addMinutes(endTime, 1))) {
//     const formattedTime = format(current, "HH:mm:ss");
//     slots.add(formattedTime);
//     current = addMinutes(current, interval);
//   }

//   return Array.from(slots);
// };

// export function TimePicker({
//   interval,
//   startTime,
//   defaultValue,
//   onChange,
//   validate,
//   disabled,
// }: {
//   interval: number;
//   startTime?: string;
//   defaultValue?: string;
//   disabled?: boolean;
//   onChange: (e: { target: { value: string } }) => void;
//   validate?: (value: string) => boolean;
// }) {
//   const timeSlots = generateTimeSlots(startTime || "00:00:00", interval);
//   const validDefaultValue =
//     defaultValue && timeSlots.includes(defaultValue)
//       ? defaultValue
//       : timeSlots[0] || "00:00:00";

//   const [selectedTime, setSelectedTime] = useState<string>(
//     validDefaultValue || ""
//   );
//   const [error, setError] = useState<string>("");

//   const handleTimeChange = (time: string) => {
//     if (validate && !validate(time)) {
//       setError("Invalid time selection");
//       return;
//     }
//     setError("");
//     setSelectedTime(time);
//     onChange({ target: { value: time } });
//   };

//   return (
//     <div className="flex flex-col items-center">
//       <Select
//         onValueChange={handleTimeChange}
//         value={selectedTime}
//         disabled={disabled}
//       >
//         <SelectTrigger className="">
//           <SelectValue placeholder="Select Time" />
//         </SelectTrigger>
//         <SelectContent>
//           {timeSlots.map((time) => (
//             <SelectItem key={time} value={time}>
//               {format(parse(time, "HH:mm:ss", new Date()), "hh:mm a")}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//       {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
//     </div>
//   );
// }

import { useState } from "react";
import { format, addMinutes, isBefore, parse } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const generateTimeSlots = (start: string, interval: number): string[] => {
  const slots: Set<string> = new Set();
  let current = parse(start, "HH:mm:ss", new Date());
  const endTime = parse("23:59:59", "HH:mm:ss", new Date());

  while (isBefore(current, addMinutes(endTime, 1))) {
    slots.add(format(current, "HH:mm:ss"));
    current = addMinutes(current, interval);
  }

  return Array.from(slots);
};

export function TimePicker({
  interval,
  startTime,
  defaultValue,
  onChange,
  validate,
  disabled,
}: {
  interval: number;
  startTime?: string;
  defaultValue?: string;
  disabled?: boolean;
  onChange: (e: { target: { value: string } }) => void;
  validate?: (value: string) => boolean;
}) {
  const timeSlots = generateTimeSlots(startTime || "00:00:00", interval);

  const [selectedTime, setSelectedTime] = useState<string>(defaultValue || "");
  const [error, setError] = useState<string>("");

  const handleTimeChange = (time: string) => {
    if (validate && !validate(time)) {
      setError("Invalid time selection");
      return;
    }
    setError("");
    setSelectedTime(time);
    onChange({ target: { value: time } });
  };

  return (
    <div className="w-full flex flex-col items-center">
      <Select
        onValueChange={handleTimeChange}
        value={selectedTime || undefined}
        disabled={disabled}
      >
        <SelectTrigger className="bg-transparent border-none text-white h-auto w-full p-2 focus:ring-0 focus:ring-offset-0">
          <SelectValue placeholder="Select Time" />
        </SelectTrigger>
        <SelectContent className="bg-black border border-white/10 text-white max-h-60 z-[9999] overflow-y-auto">
          {timeSlots.map((time) => (
            <SelectItem
              key={time}
              value={time}
              className="text-white hover:bg-turf-neon hover:text-turf-dark focus:bg-turf-neon focus:text-turf-dark cursor-pointer pl-8"
            >
              {format(parse(time, "HH:mm:ss", new Date()), "hh:mm a")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
