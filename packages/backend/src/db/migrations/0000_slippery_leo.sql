CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" varchar(1024),
	"finish_by" timestamp,
	"completed" boolean DEFAULT false,
	"completed_at" timestamp
);
