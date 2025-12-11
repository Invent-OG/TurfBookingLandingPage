import { turfs } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type Turf = InferSelectModel<typeof turfs>;
