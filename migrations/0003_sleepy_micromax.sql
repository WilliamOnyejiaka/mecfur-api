CREATE EXTENSION IF NOT EXISTS postgis;
DROP INDEX "jobs_location_idx";--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "pickup_location" geometry(point) NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "destination_location" geometry(point) NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN "pickup_latitude";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN "pickup_longitude";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN "destination_lat";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN "destination_lng";
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_mechanics_location ON mechanics USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_jobs_pickup_location ON jobs USING GIST (pickup_location);
CREATE INDEX IF NOT EXISTS idx_jobs_destination_location ON jobs USING GIST (destination_location);