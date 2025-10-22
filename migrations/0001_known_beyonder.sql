CREATE TABLE "dummy" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"location" geometry(point) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
