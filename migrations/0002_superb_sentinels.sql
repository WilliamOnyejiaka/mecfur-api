CREATE EXTENSION IF NOT EXISTS postgis;
DROP INDEX "mechanics_location_idx";--> statement-breakpoint
DROP INDEX "users_location_idx";--> statement-breakpoint
ALTER TABLE "mechanics" ADD COLUMN "location" geometry(point) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "location" geometry(point) NOT NULL;--> statement-breakpoint
ALTER TABLE "mechanics" DROP COLUMN "current_latitude";--> statement-breakpoint
ALTER TABLE "mechanics" DROP COLUMN "current_longitude";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "current_latitude";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "current_longitude";