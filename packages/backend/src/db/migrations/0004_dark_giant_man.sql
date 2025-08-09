ALTER TABLE "user_groups" ADD COLUMN "role" "group_role" DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "disabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "groups" DROP COLUMN "role";