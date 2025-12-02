-- Add sort_order columns and backfill ordered values for master lookup tables
-- This migration is idempotent (uses IF NOT EXISTS).

-- 1) Maintenance Completion Types
ALTER TABLE logiq.maintenance_completion_types
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, name ASC) - 1 AS r
  FROM logiq.maintenance_completion_types
)
UPDATE logiq.maintenance_completion_types m
SET sort_order = ranked.r
FROM ranked
WHERE ranked.id = m.id;

-- 2) Work Order Priorities
ALTER TABLE logiq.work_order_priorities
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, name ASC) - 1 AS r
  FROM logiq.work_order_priorities
)
UPDATE logiq.work_order_priorities p
SET sort_order = ranked.r
FROM ranked
WHERE ranked.id = p.id;

-- 3) Work Order Statuses
ALTER TABLE logiq.work_order_statuses
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, name ASC) - 1 AS r
  FROM logiq.work_order_statuses
)
UPDATE logiq.work_order_statuses s
SET sort_order = ranked.r
FROM ranked
WHERE ranked.id = s.id;

-- Optional: simple indexes to speed up ORDER BY usage in queries
CREATE INDEX IF NOT EXISTS idx_mct_sort_order ON logiq.maintenance_completion_types (sort_order, name);
CREATE INDEX IF NOT EXISTS idx_wop_sort_order ON logiq.work_order_priorities (sort_order, name);
CREATE INDEX IF NOT EXISTS idx_wos_sort_order ON logiq.work_order_statuses (sort_order, name);