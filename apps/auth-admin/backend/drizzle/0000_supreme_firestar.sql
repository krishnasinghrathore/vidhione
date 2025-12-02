CREATE SCHEMA IF NOT EXISTS "logiq";
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "logiq"."attachment_doc_type" AS ENUM('title_document', 'registration_document', 'inspection_document', 'drivers_license_front', 'drivers_license_back', 'medical_card', 'twic_card', 'i9_form', 'work_order_attachment', 'maintenance_record_attachment', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "logiq"."attachment_owner" AS ENUM('vehicle', 'driver', 'work_order', 'maintenance_record');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "logiq"."cdl_class" AS ENUM('A', 'B', 'C');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "logiq"."completion_type" AS ENUM('in_house', 'vendor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "logiq"."driver_status" AS ENUM('active', 'inactive', 'on_leave');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "logiq"."priority" AS ENUM('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "logiq"."vehicle_status" AS ENUM('operational', 'maintenance', 'out_of_service');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "logiq"."work_order_status" AS ENUM('scheduled', 'in_progress', 'completed', 'canceled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logiq"."attachments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_type" "logiq"."attachment_owner" NOT NULL,
	"owner_id" uuid NOT NULL,
	"doc_type" "logiq"."attachment_doc_type",
	"file_name" text NOT NULL,
	"content_type" text,
	"storage_url" text NOT NULL,
	"size_bytes" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logiq"."drivers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"driver_code" text NOT NULL,
	"full_name" text NOT NULL,
	"date_of_birth" date,
	"status" "logiq"."driver_status" DEFAULT 'active' NOT NULL,
	"phone" text,
	"email" text,
	"address" text,
	"license_number" text,
	"license_state" text,
	"license_expires" date,
	"ssn_last4" text,
	"ssn_encrypted" text,
	"cdl_class" "logiq"."cdl_class",
	"medical_card_expires" date,
	"cdl_endorsements" jsonb,
	"twic_card_number" text,
	"twic_card_expires" date,
	"hire_date" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "drivers_driver_code_unique" UNIQUE("driver_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logiq"."maintenance_records" (
	"id" uuid PRIMARY KEY NOT NULL,
	"vehicle_id" uuid,
	"service_date" date NOT NULL,
	"completion_type" "logiq"."completion_type" DEFAULT 'in_house' NOT NULL,
	"completed_by" text,
	"meter_reading" text,
	"labor_hours" numeric(6, 2),
	"total_cost" numeric(12, 2),
	"parts_used" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logiq"."maintenance_services" (
	"id" uuid PRIMARY KEY NOT NULL,
	"record_id" uuid NOT NULL,
	"description" text NOT NULL,
	"position" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logiq"."vehicles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"unit_number" text NOT NULL,
	"make" text,
	"model" text,
	"year" integer,
	"plate_number" text,
	"vin" text,
	"tire_size" text,
	"lessor_owner" text,
	"registration_expires" date,
	"inspection_expires" date,
	"status" "logiq"."vehicle_status" DEFAULT 'operational' NOT NULL,
	"mileage" integer DEFAULT 0,
	"driver_id" uuid,
	"last_service_date" date,
	"next_service_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "vehicles_unit_number_unique" UNIQUE("unit_number"),
	CONSTRAINT "vehicles_vin_unique" UNIQUE("vin")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logiq"."work_order_counters" (
	"year" integer PRIMARY KEY NOT NULL,
	"last_seq" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logiq"."work_orders" (
	"id" uuid PRIMARY KEY NOT NULL,
	"number" text NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"task_name" text NOT NULL,
	"description" text,
	"priority" "logiq"."priority" DEFAULT 'medium' NOT NULL,
	"due_date" date,
	"due_meter_reading" text,
	"est_labor_hours" numeric(6, 2),
	"est_cost" numeric(12, 2),
	"status" "logiq"."work_order_status" DEFAULT 'scheduled' NOT NULL,
	"assigned_to" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "work_orders_number_unique" UNIQUE("number")
);
