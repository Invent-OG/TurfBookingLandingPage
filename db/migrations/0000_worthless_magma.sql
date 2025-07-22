CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"turf_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"start_time" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"total_price" numeric NOT NULL,
	"status" text DEFAULT 'booked' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "turfs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"price_per_hour" numeric NOT NULL,
	"opening_time" timestamp NOT NULL,
	"closing_time" timestamp NOT NULL,
	"max_players" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_turf_id_turfs_id_fk" FOREIGN KEY ("turf_id") REFERENCES "public"."turfs"("id") ON DELETE cascade ON UPDATE no action;