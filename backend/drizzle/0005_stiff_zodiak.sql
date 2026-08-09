CREATE TABLE "leaderboard" (
	"email" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"participations" integer DEFAULT 0 NOT NULL,
	"first_places" integer DEFAULT 0 NOT NULL,
	"second_places" integer DEFAULT 0 NOT NULL,
	"third_places" integer DEFAULT 0 NOT NULL,
	"events" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hackathons" ALTER COLUMN "points_participation" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD COLUMN "github_link" text;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD COLUMN "docs_link" text;--> statement-breakpoint
ALTER TABLE "hackathons" ADD COLUMN "start_date" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "hackathons" ADD COLUMN "end_date" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "hackathons" ADD COLUMN "winner_tiers" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "hackathons" ADD COLUMN "deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "hackathons" DROP COLUMN "date";--> statement-breakpoint
ALTER TABLE "hackathons" DROP COLUMN "start_time";--> statement-breakpoint
ALTER TABLE "hackathons" DROP COLUMN "end_time";--> statement-breakpoint
ALTER TABLE "hackathons" DROP COLUMN "first_prize";--> statement-breakpoint
ALTER TABLE "hackathons" DROP COLUMN "second_prize";--> statement-breakpoint
ALTER TABLE "hackathons" DROP COLUMN "third_prize";--> statement-breakpoint
ALTER TABLE "hackathons" DROP COLUMN "points_1st";--> statement-breakpoint
ALTER TABLE "hackathons" DROP COLUMN "points_2nd";--> statement-breakpoint
ALTER TABLE "hackathons" DROP COLUMN "points_3rd";