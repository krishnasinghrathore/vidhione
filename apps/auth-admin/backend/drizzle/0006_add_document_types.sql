-- Document Types Master and Documents Storage
-- Enables dynamic document types per module with allowed extensions and mandatory flags.

-- Dependencies
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Enum for modules (driver, vehicle)
DO $$
BEGIN
  CREATE TYPE "logiq"."module_type" AS ENUM ('driver', 'vehicle');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2) document_types table
CREATE TABLE IF NOT EXISTS "logiq"."document_types" (
  "id" uuid PRIMARY KEY NOT NULL,
  "name" text NOT NULL UNIQUE,
  "allowed_extensions" text[] NOT NULL,
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  -- Ensure allowed_extensions uses only supported values and is non-empty
  CONSTRAINT "ck_document_types_allowed_ext"
    CHECK (
      array_length("allowed_extensions", 1) IS NOT NULL
      AND "allowed_extensions" <@ ARRAY['jpg','jpeg','png','pdf']::text[]
    )
);

-- 3) document_type_assignments table (per-module assignment with mandatory flag)
CREATE TABLE IF NOT EXISTS "logiq"."document_type_assignments" (
  "id" uuid PRIMARY KEY NOT NULL,
  "document_type_id" uuid NOT NULL,
  "module" "logiq"."module_type" NOT NULL,
  "mandatory" boolean NOT NULL DEFAULT false,
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "uq_document_type_assignments_doc_module" UNIQUE ("document_type_id","module"),
  CONSTRAINT "fk_document_type_assignments_type"
    FOREIGN KEY ("document_type_id")
    REFERENCES "logiq"."document_types"("id")
    ON DELETE CASCADE
);

-- 4) documents table (physical files metadata, soft-delete)
CREATE TABLE IF NOT EXISTS "logiq"."documents" (
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
  "deleted_at" timestamp with time zone NULL,
  CONSTRAINT "uq_documents_storage_path" UNIQUE ("storage_path"),
  CONSTRAINT "fk_documents_type"
    FOREIGN KEY ("document_type_id")
    REFERENCES "logiq"."document_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  -- Basic safety check: constrain to the universal allowed set (app layer enforces per-type list)
  CONSTRAINT "ck_documents_file_ext"
    CHECK ("file_ext" = ANY (ARRAY['jpg','jpeg','png','pdf']::text[]))
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS "ix_documents_entity" ON "logiq"."documents" ("module","entity_id");
CREATE INDEX IF NOT EXISTS "ix_documents_type" ON "logiq"."documents" ("document_type_id");

-- Seeding removed.
-- Rationale: avoid re-populating default document types/assignments on fresh setups.
-- Prefer a dedicated environment-specific seed workflow (outside schema migrations).