import { uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { logiq } from '../schema';
import { moduleTypeEnum } from '../enums';
import { documentTypes } from './document_types';

/**
 * Archived documents storage metadata (cold storage)
 * Mirrors "documents" plus archivedAt/archivedBy metadata.
 * Path convention (cold): backend/uploads/_archive/{module}/{entityId}/{documentTypeId}/{documentId}.{ext}
 */
export const archivedDocuments = logiq.table('archived_documents', {
  id: uuid('id').primaryKey(),
  module: moduleTypeEnum('module').notNull(),
  entityId: uuid('entity_id').notNull(),
  documentTypeId: uuid('document_type_id')
    .references(() => documentTypes.id, { onDelete: 'restrict', onUpdate: 'cascade' })
    .notNull(),
  originalFilename: text('original_filename').notNull(),
  mimeType: text('mime_type').notNull(),
  fileExt: text('file_ext').notNull(),
  fileSizeBytes: integer('file_size_bytes').notNull(),
  storagePath: text('storage_path').notNull(),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow().notNull(),
  uploadedBy: uuid('uploaded_by'),
  // Archived metadata
  archivedAt: timestamp('archived_date', { withTimezone: true }).defaultNow().notNull(),
  archivedBy: uuid('archived_by'),
});

export type ArchivedDocumentRow = typeof archivedDocuments.$inferSelect;
export type NewArchivedDocumentRow = typeof archivedDocuments.$inferInsert;