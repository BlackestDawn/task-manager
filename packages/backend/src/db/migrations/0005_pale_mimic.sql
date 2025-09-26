CREATE TYPE "public"."user_role" AS ENUM('admin', 'manager', 'user');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "access_level" "public"."user_role" DEFAULT 'user' NOT NULL;