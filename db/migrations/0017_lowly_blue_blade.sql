CREATE TABLE "turf_peak_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"turf_id" uuid NOT NULL,
	"days_of_week" text[],
	"specific_date" date,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"price" numeric NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "turf_peak_hours" ADD CONSTRAINT "turf_peak_hours_turf_id_turfs_id_fk" FOREIGN KEY ("turf_id") REFERENCES "public"."turfs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "turfs" DROP COLUMN "peak_hours_start";--> statement-breakpoint
ALTER TABLE "turfs" DROP COLUMN "peak_hours_end";--> statement-breakpoint
ALTER TABLE "turfs" DROP COLUMN "peak_hour_price";