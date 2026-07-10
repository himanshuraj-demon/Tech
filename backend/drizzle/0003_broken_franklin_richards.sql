CREATE TABLE "admin_emails" (
	"email" text PRIMARY KEY NOT NULL,
	"modified_by" text DEFAULT 'system' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_registrations" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"user_id" text NOT NULL,
	"user_name" text NOT NULL,
	"user_email" text NOT NULL,
	"degree_type" text NOT NULL,
	"year_of_joining" text NOT NULL,
	"branch_name" text NOT NULL,
	"team_members" jsonb,
	"winner_place" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hackathons" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"long_description" text NOT NULL,
	"date" text NOT NULL,
	"start_time" text,
	"end_time" text,
	"location" text NOT NULL,
	"category" text NOT NULL,
	"status" text NOT NULL,
	"registration_link" text,
	"organizer_name" text,
	"organizer_email" text,
	"organizer_phone" text,
	"organizer_website" text,
	"requirements" text,
	"eligibility" text,
	"team_size" text,
	"first_prize" text,
	"second_prize" text,
	"third_prize" text,
	"special_prizes" text,
	"timeline" text,
	"important_notes" text,
	"themes" text,
	"juding_criteria" text,
	"submission_guidelines" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "torque_magazines" (
	"id" text PRIMARY KEY NOT NULL,
	"year" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"pages" integer NOT NULL,
	"articles" integer NOT NULL,
	"featured" text NOT NULL,
	"file_path" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"cover_photo" text,
	"cover_photo_file_name" text,
	"is_latest" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "team_required" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "event_time" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "points_1st" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "points_2nd" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "points_3rd" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "points_participation" integer DEFAULT 0 NOT NULL;