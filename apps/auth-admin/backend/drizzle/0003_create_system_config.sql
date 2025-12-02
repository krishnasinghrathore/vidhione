CREATE TABLE IF NOT EXISTS "logiq"."system_config" (
  "key" text PRIMARY KEY,
  "value_int" integer,
  "value_text" text,
  "value_json" jsonb,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Seed default minimum driver age if not present
INSERT INTO "logiq"."system_config" ("key", "value_int")
SELECT 'min_driver_age', 18
WHERE NOT EXISTS (
  SELECT 1 FROM "logiq"."system_config" WHERE "key" = 'min_driver_age'
);