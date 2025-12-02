-- ArchivedDocuments table (cold storage) mirroring logiq.documents with extra archive metadata
-- FK policies:
--  - document_type_id -> logiq.document_types.id ON DELETE RESTRICT (prevents deleting a type in use by archived rows)

-- 1) Ensure enum exists (created earlier in 0006), no-op if already present
DO $$
BEGIN
  PERFORM 1 FROM pg_type WHERE typname = 'module_type' AND typnamespace = 'logiq'::regnamespace;
  IF NOT FOUND THEN
    CREATE TYPE "logiq"."module_type" AS ENUM ('driver', 'vehicle');
  END IF;
END $$;

-- 2) Create archived_documents table
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
  "uploaded_at" timestamp with time zone NOT NULL DEFAULT now(),
  "uploaded_by" uuid NULL,
  -- Archive metadata
  "archived_date" timestamp with time zone NOT NULL DEFAULT now(),
  "archived_by" uuid NULL,
  CONSTRAINT "fk_archived_documents_type"
    FOREIGN KEY ("document_type_id")
    REFERENCES "logiq"."document_types"("id")
    ON DELETE RESTRICT
);

-- 3) Helpful indexes
CREATE UNIQUE INDEX IF NOT EXISTS "uq_archived_documents_storage_path" ON "logiq"."archived_documents" ("storage_path");
CREATE INDEX IF NOT EXISTS "ix_archived_documents_entity" ON "logiq"."archived_documents" ("module","entity_id");
CREATE INDEX IF NOT EXISTS "ix_archived_documents_type" ON "logiq"."archived_documents" ("document_type_id");
CREATE INDEX IF NOT EXISTS "ix_archived_documents_archived_date" ON "logiq"."archived_documents" ("archived_date" DESC);