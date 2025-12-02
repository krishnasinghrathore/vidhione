CREATE TABLE IF NOT EXISTS "logiq"."work_order_priorities" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "work_order_priorities_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logiq"."work_order_statuses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "work_order_statuses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "logiq"."work_orders" ALTER COLUMN "priority" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "logiq"."work_orders" ALTER COLUMN "priority" SET DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE "logiq"."work_orders" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "logiq"."work_orders" ALTER COLUMN "status" SET DEFAULT 'scheduled';