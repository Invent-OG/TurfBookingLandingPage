ALTER TABLE "turfs" ADD COLUMN "is_weekday_pricing_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "weekday_morning_start" time DEFAULT '06:01';--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "weekday_evening_start" time DEFAULT '18:00';--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "weekday_morning_price" numeric;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "weekday_evening_price" numeric;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "is_weekend_pricing_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "weekend_morning_start" time DEFAULT '06:01';--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "weekend_evening_start" time DEFAULT '18:00';--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "weekend_morning_price" numeric;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "weekend_evening_price" numeric;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "peak_hours_start" time;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "peak_hours_end" time;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "peak_hour_price" numeric;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "slot_interval" integer DEFAULT 60;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "is_disabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "disabled_reason" text;