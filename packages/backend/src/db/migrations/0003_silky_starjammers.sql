CREATE TYPE "public"."group_role" AS ENUM('admin', 'manager', 'editor', 'user', 'viewer', 'none');--> statement-breakpoint
ALTER TABLE "groups" DROP CONSTRAINT "groups_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "groups" ALTER COLUMN "role" SET DEFAULT 'user'::"public"."group_role";--> statement-breakpoint
ALTER TABLE "groups" ALTER COLUMN "role" SET DATA TYPE "public"."group_role" USING "role"::"public"."group_role";--> statement-breakpoint
ALTER TABLE "groups" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "groups" DROP COLUMN "created_by";