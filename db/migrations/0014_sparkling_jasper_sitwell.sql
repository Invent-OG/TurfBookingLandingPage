ALTER TABLE "turfs" ALTER COLUMN "slot_interval" SET DEFAULT 60;--> statement-breakpoint
ALTER TABLE "turfs" ALTER COLUMN "slot_interval" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "is_weekday_pricing_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "weekday_morning_start" time DEFAULT '06:01';--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "weekday_evening_start" time DEFAULT '18:00';--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "weekday_morning_price" numeric;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "weekday_evening_price" numeric;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "weekend_morning_start" time DEFAULT '06:01';--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "weekend_evening_start" time DEFAULT '18:00';--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "weekend_morning_price" numeric;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "weekend_evening_price" numeric;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "peak_hour_price" numeric;--> statement-breakpoint
ALTER TABLE "turfs" DROP COLUMN "peak_price_per_hour";--> statement-breakpoint
ALTER TABLE "turfs" DROP COLUMN "weekend_price_per_hour";