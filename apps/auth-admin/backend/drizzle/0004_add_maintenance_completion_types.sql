-- Ensure UUID generation function exists (for gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create master table for maintenance completion types
CREATE TABLE IF NOT EXISTS "logiq"."maintenance_completion_types" (
  "id" uuid PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "label" text NOT NULL,
  "is_default" boolean NOT NULL DEFAULT false,
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- If the table already existed from a prior revision without the "code"/"label" columns,
-- add them to ensure the UPSERT and updates below work idempotently.
ALTER TABLE "logiq"."maintenance_completion_types"
  ADD COLUMN IF NOT EXISTS "code" text UNIQUE;
ALTER TABLE "logiq"."maintenance_completion_types"
  ADD COLUMN IF NOT EXISTS "label" text;

-- Seed rows removed as per requirement (no default records inserted)

-- Add FK column to maintenance_records (left nullable; no backfill or default)
ALTER TABLE "logiq"."maintenance_records"
  ADD COLUMN IF NOT EXISTS "maintenance_completion_type_id" uuid;

-- Add FK constraint (idempotent)
DO $$
BEGIN
  ALTER TABLE "logiq"."maintenance_records"
    ADD CONSTRAINT "fk_maintenance_records_completion_type"
    FOREIGN KEY ("maintenance_completion_type_id")
    REFERENCES "logiq"."maintenance_completion_types"("id");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Helpful index
CREATE INDEX IF NOT EXISTS "ix_maintenance_records_completion_type"
  ON "logiq"."maintenance_records" ("maintenance_completion_type_id");