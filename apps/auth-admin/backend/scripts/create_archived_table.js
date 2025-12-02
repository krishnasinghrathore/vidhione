// Create only the archived_documents table (and required objects) safely.
// Usage: node scripts/create_archived_table.js
require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();

    // Ensure schema 'logiq' exists
    await client.query(`CREATE SCHEMA IF NOT EXISTS "logiq";`);

    // Ensure enum type exists (same values as in app)
    await client.query(`
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'logiq' AND t.typname = 'module_type'
  ) THEN
    CREATE TYPE "logiq"."module_type" AS ENUM ('driver','vehicle');
  END IF;
END $$;
    `);

    // Create table if not exists
    await client.query(`
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
  "uploaded_at" timestamptz NOT NULL DEFAULT now(),
  "uploaded_by" uuid NULL,
  "archived_date" timestamptz NOT NULL DEFAULT now(),
  "archived_by" uuid NULL
);
    `);

    // Unique and helpful indexes
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "uq_archived_documents_storage_path" ON "logiq"."archived_documents" ("storage_path");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "ix_archived_documents_entity" ON "logiq"."archived_documents" ("module","entity_id");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "ix_archived_documents_type" ON "logiq"."archived_documents" ("document_type_id");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "ix_archived_documents_archived_date" ON "logiq"."archived_documents" ("archived_date" DESC);`);

    // Add FK to document_types if missing
    await client.query(`
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
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
    `);

    // Verify
    const t = await client.query(`SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema='logiq' AND table_name='archived_documents'`);
    console.log('[verify table]', t.rows);
    const cols = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='logiq' AND table_name='archived_documents' ORDER BY ordinal_position`);
    console.log('[verify columns]', cols.rows);
    console.log('[done] archived_documents is ready.');
  } catch (e) {
    console.error('[error]', e);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();