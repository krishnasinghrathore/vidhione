-- Migration 0006: Remove "code" columns and enforce unique(name) for priority/status tables
-- Idempotent: safe to run multiple times

-- Drop unique constraint on "code" for priorities (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'logiq'
      AND table_name = 'work_order_priorities'
      AND constraint_name = 'work_order_priorities_code_unique'
  ) THEN
    ALTER TABLE "logiq"."work_order_priorities" DROP CONSTRAINT "work_order_priorities_code_unique";
  END IF;
END $$;

-- Drop "code" column from priorities (if exists)
ALTER TABLE "logiq"."work_order_priorities"
  DROP COLUMN IF EXISTS "code";

-- Ensure unique(name) on priorities
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'logiq'
      AND table_name = 'work_order_priorities'
      AND constraint_type = 'UNIQUE'
      AND constraint_name = 'work_order_priorities_name_key'
  ) THEN
    ALTER TABLE "logiq"."work_order_priorities"
      ADD CONSTRAINT "work_order_priorities_name_key" UNIQUE ("name");
  END IF;
END $$;

-- Drop unique constraint on "code" for statuses (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'logiq'
      AND table_name = 'work_order_statuses'
      AND constraint_name = 'work_order_statuses_code_unique'
  ) THEN
    ALTER TABLE "logiq"."work_order_statuses" DROP CONSTRAINT "work_order_statuses_code_unique";
  END IF;
END $$;

-- Drop "code" column from statuses (if exists)
ALTER TABLE "logiq"."work_order_statuses"
  DROP COLUMN IF EXISTS "code";

-- Ensure unique(name) on statuses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'logiq'
      AND table_name = 'work_order_statuses'
      AND constraint_type = 'UNIQUE'
      AND constraint_name = 'work_order_statuses_name_key'
  ) THEN
    ALTER TABLE "logiq"."work_order_statuses"
      ADD CONSTRAINT "work_order_statuses_name_key" UNIQUE ("name");
  END IF;
END $$;