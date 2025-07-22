ALTER TABLE "bookings" ALTER COLUMN "date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "start_time" SET DATA TYPE time;--> statement-breakpoint
ALTER TABLE "turfs" ALTER COLUMN "opening_time" SET DATA TYPE time;--> statement-breakpoint
ALTER TABLE "turfs" ALTER COLUMN "closing_time" SET DATA TYPE time;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "description" text NOT NULL;--> statement-breakpoint
ALTER TABLE "turfs" ADD COLUMN "location" text NOT NULL;