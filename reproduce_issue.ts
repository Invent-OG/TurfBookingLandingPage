import { format } from "date-fns";

const checkDate = () => {
  // Simulate "today" as 2025-12-12
  const now = new Date("2025-12-12T19:13:56+05:30");
  const todayStr = format(now, "yyyy-MM-dd");

  console.log("Current Time:", now.toISOString());
  console.log("Today String:", todayStr);

  const check = (dateStr: string, label: string) => {
    const pickerDate = new Date(dateStr);
    const formattedDate = format(pickerDate, "yyyy-MM-dd");

    // NEW LOGIC
    let isDisabled = false;
    if (formattedDate < todayStr) {
      isDisabled = true;
    }

    console.log(
      `Checking ${label} (${formattedDate}): Disabled? ${isDisabled}`
    );
  };

  check("2025-12-12T00:00:00+05:30", "Today");
  check("2025-12-11T00:00:00+05:30", "Yesterday");
  check("2025-12-13T00:00:00+05:30", "Tomorrow");
};

checkDate();
