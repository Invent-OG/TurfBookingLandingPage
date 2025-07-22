ALTER TABLE "bookings" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "payment_method" text NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "customer_name" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "customer_contact" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "created_by" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;