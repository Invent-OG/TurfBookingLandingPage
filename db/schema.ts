import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  numeric,
  time,
  date,
  boolean,
  varchar,
  unique,
} from "drizzle-orm/pg-core";

// Users Table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Turfs Table
export const turfs = pgTable("turfs", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(),
  pricePerHour: numeric("price_per_hour").notNull(),
  openingTime: time("opening_time").notNull(),
  closingTime: time("closing_time").notNull(),
  maxPlayers: integer("max_players").notNull(),
  maxHours: integer("max_hours").notNull(),
  minHours: integer("min_hours").notNull(),

  isWeekdayPricingEnabled: boolean("is_weekday_pricing_enabled").default(false), // Enable/disable weekday pricing
  weekdayMorningStart: time("weekday_morning_start").default("06:01"), // Morning start time
  weekdayEveningStart: time("weekday_evening_start").default("18:00"), // Evening start time
  weekdayMorningPrice: numeric("weekday_morning_price"), // Morning price
  weekdayEveningPrice: numeric("weekday_evening_price"), // Evening price

  isWeekendPricingEnabled: boolean("is_weekend_pricing_enabled").default(false), // Enable/disable weekend pricing
  weekendMorningStart: time("weekend_morning_start").default("06:01"), // Morning start time
  weekendEveningStart: time("weekend_evening_start").default("18:00"), // Evening start time
  weekendMorningPrice: numeric("weekend_morning_price"), // Morning price
  weekendEveningPrice: numeric("weekend_evening_price"), // Evening price

  slotInterval: integer("slot_interval").default(60), // Default slot interval is 60 minutes

  isDisabled: boolean("is_disabled").default(false),
  disabledReason: text("disabled_reason"),

  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  imageUrl: text("image_url"),
});

export const turfPeakHours = pgTable("turf_peak_hours", {
  id: uuid("id").defaultRandom().primaryKey(),

  turfId: uuid("turf_id")
    .references(() => turfs.id, { onDelete: "cascade" })
    .notNull(),

  type: text("type", { enum: ["day", "date"] }) // <-- ✅ Added field
    .notNull(),

  daysOfWeek: text("days_of_week").array(), // For recurring days
  specificDate: date("specific_date"), // For specific dates

  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  price: numeric("price").notNull(),

  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});
// Bookings Table
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }), // Nullable for walk-ins
    turfId: uuid("turf_id")
      .notNull()
      .references(() => turfs.id, { onDelete: "cascade" }),
    turfName: text("turf_name").notNull(), // Store turf name
    date: date("date").notNull(),
    startTime: time("start_time").notNull(),
    duration: integer("duration").notNull(),
    totalPrice: numeric("total_price").notNull(),
    status: text("status").default("booked").notNull(),
    paymentMethod: text("payment_method").notNull(), // Required for tracking payment type
    customerName: text("customer_name"), // Optional (for walk-in customers)
    customerPhone: text("customer_phone"), // Store customer’s phone
    customerEmail: text("customer_email"), // Store customer’s email
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }), // Tracks the admin making manual bookings
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      uniqueTurfBooking: unique("unique_turf_booking").on(
        table.turfId,
        table.date,
        table.startTime
      ),
    };
  }
);
export const blockedDates = pgTable(
  "blocked_dates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    turfId: uuid("turf_id")
      .notNull()
      .references(() => turfs.id, { onDelete: "cascade" }),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    blockedTimes: time("blocked_times").array(), // ✅ Now using time[] correctly
    reason: varchar("reason", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  // ✅ Add Unique Constraint for ON CONFLICT usage
  (t) => ({
    uniqueTurfDate: unique().on(t.turfId, t.startDate),
  })
);
