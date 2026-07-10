ALTER TABLE "hackathons" ADD COLUMN "draft" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "hackathons" ADD COLUMN "team_required" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "hackathons" ADD COLUMN "points_1st" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "hackathons" ADD COLUMN "points_2nd" integer DEFAULT 75 NOT NULL;--> statement-breakpoint
ALTER TABLE "hackathons" ADD COLUMN "points_3rd" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "hackathons" ADD COLUMN "points_participation" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "team_required";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "event_time";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "points_1st";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "points_2nd";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "points_3rd";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "points_participation";