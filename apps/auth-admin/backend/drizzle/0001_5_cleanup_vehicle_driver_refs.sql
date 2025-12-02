-- Cleanup orphaned vehicle.driver_id values before adding FK
-- This sets driver_id to NULL where no corresponding drivers.id exists.
UPDATE "logiq"."vehicles" v
SET "driver_id" = NULL
WHERE v."driver_id" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "logiq"."drivers" d
    WHERE d."id" = v."driver_id"
  );