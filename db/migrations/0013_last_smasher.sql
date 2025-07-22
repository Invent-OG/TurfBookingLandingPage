ALTER TABLE "turfs" ADD COLUMN "peak_price_per_hour" numeric;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "weekend_price_per_hour" numeric;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "is_weekend_pricing_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "peak_hours_start" time;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "peak_hours_end" time;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "slot_interval" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "is_disabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "disabled_reason" text;