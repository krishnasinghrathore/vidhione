import { uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { logiq } from '../schema';
import { moduleTypeEnum } from '../enums';
import { documentTypes } from './document_types';

/**
 * Documents storage metadata (soft delete via deletedAt)
 * Path convention: backend/uploads/{module}/{entityId}/{documentTypeId}/{documentId}.{ext}
 */
export const documents = logiq.table('documents', {
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
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// Types
export type DocumentRow = typeof documents.$inferSelect;
export type NewDocumentRow = typeof documents.$inferInsert;