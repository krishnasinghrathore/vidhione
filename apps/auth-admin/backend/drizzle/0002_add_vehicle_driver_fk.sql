-- Migration: add FK constraint on vehicles.driver_id to drivers.id
-- Safe to run multiple times; guards duplicate_object for constraint; IF NOT EXISTS for index
DO $$ BEGIN
  ALTER TABLE "logiq"."vehicles"
    ADD CONSTRAINT "vehicles_driver_id_fkey"
    FOREIGN KEY ("driver_id") REFERENCES "logiq"."drivers"("id")
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "idx_vehicles_driver_id" ON "logiq"."vehicles" ("driver_id");