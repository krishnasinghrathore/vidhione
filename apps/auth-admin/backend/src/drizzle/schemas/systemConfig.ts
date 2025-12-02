import { text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { logiq } from './schema';

/**
 * System-wide key/value configuration table
 * Backed by migrations: see backend/drizzle/0003_create_system_config.sql
 */
export const systemConfig = logiq.table('system_config', {
  key: text('key').primaryKey(),
  valueInt: integer('value_int'),
  valueText: text('value_text'),
  valueJson: jsonb('value_json'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type SystemConfigRow = typeof systemConfig.$inferSelect;
export type SystemConfigInsert = typeof systemConfig.$inferInsert;
