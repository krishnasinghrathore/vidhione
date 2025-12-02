import { auth } from './schema';

/**
 * Shared Postgres enum types for Drizzle schemas under the "auth" schema.
 */

// Auth-related enums
export const userStatusEnum = auth.enum('user_status', ['active', 'inactive', 'pending_verification']);
export const invitationStatusEnum = auth.enum('invitation_status', ['pending', 'accepted', 'expired', 'cancelled']);

// Generic enums
export const priorityEnum = auth.enum('priority', ['low', 'medium', 'high']);

// Attachment enums (keeping for general use)
export const attachmentOwnerEnum = auth.enum('attachment_owner', ['user', 'company', 'document']);
export const attachmentDocTypeEnum = auth.enum('attachment_doc_type', [
  'profile_picture',
  'company_logo',
  'document',
  'certificate',
  'other',
]);
