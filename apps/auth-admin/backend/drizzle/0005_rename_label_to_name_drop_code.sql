-- Migration 0005: Rename "label" to "name" and drop "code" from maintenance_completion_types
-- Schema: logiq

-- 1) Rename column "label" - guard if it already ran and avoid conflict if "name" already exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'logiq'
      AND table_name = 'maintenance_completion_types'
      AND column_name = 'label'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'logiq'
      AND table_name = 'maintenance_completion_types'
      AND column_name = 'name'
  ) THEN
    EXECUTE 'ALTER TABLE "logiq"."maintenance_completion_types" RENAME COLUMN "label" TO "name"';
  END IF;
END $$;

-- 2) Drop UNIQUE constraint on "code" if present (usually named maintenance_completion_types_code_key)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'logiq'
      AND table_name = 'maintenance_completion_types'
      AND constraint_type = 'UNIQUE'
      AND constraint_name = 'maintenance_completion_types_code_key'
  ) THEN
    EXECUTE 'ALTER TABLE "logiq"."maintenance_completion_types" DROP CONSTRAINT "maintenance_completion_types_code_key"';
  END IF;
END $$;

-- 3) Drop "code" column (idempotent)
ALTER TABLE "logiq"."maintenance_completion_types"
  DROP COLUMN IF EXISTS "code";

-- 4) Ensure UNIQUE on "name"
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'logiq'
      AND table_name = 'maintenance_completion_types'
      AND constraint_type = 'UNIQUE'
      AND constraint_name = 'maintenance_completion_types_name_key'
  ) THEN
    EXECUTE 'ALTER TABLE "logiq"."maintenance_completion_types" ADD CONSTRAINT "maintenance_completion_types_name_key" UNIQUE ("name")';
  END IF;
END $$;

-- Note:
-- We intentionally do not modify "is_default" here to preserve any admin-driven changes made after initial seeding.