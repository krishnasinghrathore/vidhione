import { uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { logiq } from '../schema';

/**
 * Master table for Document Types
 * - name: human-readable unique name
 * - allowedExtensions: array of allowed file extensions per type (e.g., ['jpg','jpeg','png','pdf'])
 * - active: soft-active flag for administrative control
 */
export const documentTypes = logiq.table('document_types', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  allowedExtensions: text('allowed_extensions').array().notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Types
export type DocumentType = typeof documentTypes.$inferSelect;
export type NewDocumentType = typeof documentTypes.$inferInsert;