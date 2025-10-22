ALTER TABLE "user_groups" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_groups" ALTER COLUMN "role" SET DEFAULT 'user'::text;--> statement-breakpoint
DROP TYPE "public"."group_role";--> statement-breakpoint
CREATE TYPE "public"."group_role" AS ENUM('supervisor', 'editor', 'user', 'viewer', 'none');--> statement-breakpoint
ALTER TABLE "user_groups" ALTER COLUMN "role" SET DEFAULT 'user'::"public"."group_role";--> statement-breakpoint
ALTER TABLE "user_groups" ALTER COLUMN "role" SET DATA TYPE "public"."group_role" USING "role"::"public"."group_role";--> statement-breakpoint