ALTER TABLE "bookings" RENAME COLUMN "customer_contact" TO "customer_phone";--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "customer_email" text;