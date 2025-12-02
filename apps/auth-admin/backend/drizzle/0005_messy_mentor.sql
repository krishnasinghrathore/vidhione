-- Make this migration idempotent to avoid failures when the constraint already disappeared
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

ALTER TABLE "logiq"."maintenance_completion_types"
  ADD COLUMN IF NOT EXISTS "sort_order" integer DEFAULT 0 NOT NULL;

ALTER TABLE "logiq"."work_order_priorities"
  ADD COLUMN IF NOT EXISTS "sort_order" integer DEFAULT 0 NOT NULL;

ALTER TABLE "logiq"."work_order_statuses"
  ADD COLUMN IF NOT EXISTS "sort_order" integer DEFAULT 0 NOT NULL;

-- Drop legacy enum column on maintenance_records if it still exists
ALTER TABLE "logiq"."maintenance_records"
  DROP COLUMN IF EXISTS "completion_type";

-- Drop legacy code columns if they still exist
ALTER TABLE "logiq"."work_order_priorities"
  DROP COLUMN IF EXISTS "code";

ALTER TABLE "logiq"."work_order_statuses"
  DROP COLUMN IF EXISTS "code";

-- Ensure unique(name) constraints exist (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'logiq'
      AND table_name = 'work_order_priorities'
      AND constraint_name = 'work_order_priorities_name_unique'
  ) THEN
    ALTER TABLE "logiq"."work_order_priorities" ADD CONSTRAINT "work_order_priorities_name_unique" UNIQUE("name");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'logiq'
      AND table_name = 'work_order_statuses'
      AND constraint_name = 'work_order_statuses_name_unique'
  ) THEN
    ALTER TABLE "logiq"."work_order_statuses" ADD CONSTRAINT "work_order_statuses_name_unique" UNIQUE("name");
  END IF;
END $$;

-- Drop legacy enum type if it still exists
DROP TYPE IF EXISTS "logiq"."completion_type";