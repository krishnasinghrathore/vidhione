import { uuid, boolean, timestamp } from 'drizzle-orm/pg-core';
import { logiq } from '../schema';
import { moduleTypeEnum } from '../enums';
import { documentTypes } from './document_types';

/**
 * Assigns a Document Type to a module with a mandatory flag.
 * - module: 'driver' | 'vehicle' (enum)
 * - mandatory: whether this document type is required for the module
 * - active: administrative enable/disable
 */
export const documentTypeAssignments = logiq.table('document_type_assignments', {
  id: uuid('id').primaryKey(),
  documentTypeId: uuid('document_type_id')
    .references(() => documentTypes.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  module: moduleTypeEnum('module').notNull(),
  mandatory: boolean('mandatory').default(false).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Types
export type DocumentTypeAssignment = typeof documentTypeAssignments.$inferSelect;
export type NewDocumentTypeAssignment = typeof documentTypeAssignments.$inferInsert;