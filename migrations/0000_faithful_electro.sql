CREATE TYPE "public"."cancelledBy" AS ENUM('user', 'mechanic');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('pending', 'searching', 'accepted', 'mechanic_enroute', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."urgency" AS ENUM('low', 'normal', 'high', 'emergency');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"mechanic_id" uuid,
	"issue_type" varchar(50) NOT NULL,
	"issue_description" text NOT NULL,
	"urgency" "urgency" DEFAULT 'normal' NOT NULL,
	"pickup_latitude" real NOT NULL,
	"pickup_longitude" real NOT NULL,
	"pickup_address" text NOT NULL,
	"destination_lat" real,
	"destination_lng" real,
	"destination_address" text,
	"status" "job_status" DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"accepted_at" timestamp,
	"arrived_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"estimated_arrival" timestamp,
	"estimated_duration" integer,
	"cancelledBy" "cancelledBy" NOT NULL,
	"cancellation_reason" text,
	"vehicle_make" varchar(50),
	"vehicle_model" varchar(50),
	"vehicle_year" integer,
	"vehicle_plate" varchar(20),
	"photo_urls" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mechanics" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"password" text NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"profile_picture" json,
	"date_of_birth" timestamp,
	"skills" text[] DEFAULT '{}' NOT NULL,
	"years_experience" integer DEFAULT 0 NOT NULL,
	"bio" text,
	"base_city" varchar(100) NOT NULL,
	"current_latitude" real,
	"current_longitude" real,
	"current_address" text,
	"is_online" boolean DEFAULT false NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verification_status" "verification_status" DEFAULT 'pending' NOT NULL,
	"verification_notes" text,
	"verified_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_suspended" boolean DEFAULT false NOT NULL,
	"suspension_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_active" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mechanics_email_unique" UNIQUE("email"),
	CONSTRAINT "mechanics_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"password" text NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"profile_picture" json,
	"current_city" varchar(100),
	"current_latitude" real,
	"current_longitude" real,
	"current_address" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_active" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_mechanic_id_mechanics_id_fk" FOREIGN KEY ("mechanic_id") REFERENCES "public"."mechanics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "jobs_user_idx" ON "jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "jobs_mechanic_idx" ON "jobs" USING btree ("mechanic_id");--> statement-breakpoint
CREATE INDEX "jobs_status_idx" ON "jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "jobs_requested_at_idx" ON "jobs" USING btree ("requested_at");--> statement-breakpoint
CREATE INDEX "jobs_location_idx" ON "jobs" USING btree ("pickup_latitude","pickup_longitude");--> statement-breakpoint
CREATE UNIQUE INDEX "mechanics_email_idx" ON "mechanics" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "mechanics_phone_idx" ON "mechanics" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "mechanics_location_idx" ON "mechanics" USING btree ("current_latitude","current_longitude");--> statement-breakpoint
CREATE INDEX "mechanics_availability_idx" ON "mechanics" USING btree ("is_online","is_available","is_verified");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_phone_idx" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "users_location_idx" ON "users" USING btree ("current_latitude","current_longitude");