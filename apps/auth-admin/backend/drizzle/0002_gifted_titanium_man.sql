DO $$
BEGIN
  CREATE TYPE "logiq"."module_type" AS ENUM('driver', 'vehicle');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logiq"."archived_documents" (
	"id" uuid PRIMARY KEY NOT NULL,
	"module" "logiq"."module_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"document_type_id" uuid NOT NULL,
	"original_filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_ext" text NOT NULL,
	"file_size_bytes" integer NOT NULL,
	"storage_path" text NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"uploaded_by" uuid,
	"archived_date" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logiq"."document_type_assignments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"document_type_id" uuid NOT NULL,
	"module" "logiq"."module_type" NOT NULL,
	"mandatory" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logiq"."document_types" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"allowed_extensions" text[] NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logiq"."documents" (
	"id" uuid PRIMARY KEY NOT NULL,
	"module" "logiq"."module_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"document_type_id" uuid NOT NULL,
	"original_filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_ext" text NOT NULL,
	"file_size_bytes" integer NOT NULL,
	"storage_path" text NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"uploaded_by" uuid,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logiq"."maintenance_completion_types" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logiq"."system_config" (
	"key" text PRIMARY KEY NOT NULL,
	"value_int" integer,
	"value_text" text,
	"value_json" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "logiq"."maintenance_records" ADD COLUMN IF NOT EXISTS "maintenance_completion_type_id" uuid;--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema='logiq'
      AND table_name='archived_documents'
      AND constraint_type='FOREIGN KEY'
      AND constraint_name='archived_documents_document_type_id_document_types_id_fk'
  ) THEN
    ALTER TABLE "logiq"."archived_documents"
      ADD CONSTRAINT "archived_documents_document_type_id_document_types_id_fk"
      FOREIGN KEY ("document_type_id")
      REFERENCES "logiq"."document_types"("id")
      ON DELETE restrict ON UPDATE cascade;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema='logiq'
      AND table_name='document_type_assignments'
      AND constraint_type='FOREIGN KEY'
      AND constraint_name='document_type_assignments_document_type_id_document_types_id_fk'
  ) THEN
    ALTER TABLE "logiq"."document_type_assignments"
      ADD CONSTRAINT "document_type_assignments_document_type_id_document_types_id_fk"
      FOREIGN KEY ("document_type_id")
      REFERENCES "logiq"."document_types"("id")
      ON DELETE cascade ON UPDATE cascade;
  END IF;
END $$;--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema='logiq'
      AND table_name='documents'
      AND constraint_type='FOREIGN KEY'
      AND constraint_name='documents_document_type_id_document_types_id_fk'
  ) THEN
    ALTER TABLE "logiq"."documents"
      ADD CONSTRAINT "documents_document_type_id_document_types_id_fk"
      FOREIGN KEY ("document_type_id")
      REFERENCES "logiq"."document_types"("id")
      ON DELETE restrict ON UPDATE cascade;
  END IF;
END $$;--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema='logiq'
      AND table_name='vehicles'
      AND constraint_type='FOREIGN KEY'
      AND constraint_name='vehicles_driver_id_drivers_id_fk'
  ) THEN
    ALTER TABLE "logiq"."vehicles"
      ADD CONSTRAINT "vehicles_driver_id_drivers_id_fk"
      FOREIGN KEY ("driver_id")
      REFERENCES "logiq"."drivers"("id")
      ON DELETE restrict ON UPDATE cascade;
  END IF;
END $$;