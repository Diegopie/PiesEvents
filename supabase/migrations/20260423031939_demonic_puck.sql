ALTER TABLE "signups" RENAME COLUMN "event_id" TO "activity_id";--> statement-breakpoint
ALTER TABLE "signups" DROP CONSTRAINT "signups_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "signups" ADD CONSTRAINT "signups_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;