import { uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { attachmentOwnerEnum, attachmentDocTypeEnum } from './enums';
import { logiq } from './schema';

/**
 * Attachments (polymorphic)
 */
export const attachments = logiq.table('attachments', {
  id: uuid('id').primaryKey(),
  ownerType: attachmentOwnerEnum('owner_type').notNull(),
  ownerId: uuid('owner_id').notNull(),
  docType: attachmentDocTypeEnum('doc_type'),
  fileName: text('file_name').notNull(),
  contentType: text('content_type'),
  storageUrl: text('storage_url').notNull(),
  sizeBytes: integer('size_bytes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;
