CREATE TABLE "blocked_dates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"turf_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"blocked_times" text[],
	"is_recurring" boolean DEFAULT false,
	"reason" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "blocked_dates" ADD CONSTRAINT "blocked_dates_turf_id_turfs_id_fk" FOREIGN KEY ("turf_id") REFERENCES "public"."turfs"("id") ON DELETE cascade ON UPDATE no action;