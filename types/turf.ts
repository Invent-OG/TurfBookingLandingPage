import { turfs } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type Turf = InferSelectModel<typeof turfs> & {
  isWeekdayPricingEnabled?: boolean | null;
  weekdayRules?: { startTime: string; endTime: string; price: number }[] | null;

  isWeekendPricingEnabled?: boolean | null;
  weekendRules?: { startTime: string; endTime: string; price: number }[] | null;

  slotInterval?: number | null;
};
