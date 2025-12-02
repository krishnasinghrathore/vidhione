import { migrate } from 'drizzle-orm/node-postgres/migrator';
import db from './client';

/**
 * Applies pending Drizzle migrations from the "drizzle" folder.
 * Safe to call on every startup; runs only unapplied migrations.
 *
 * Note:
 * - All TABLES/ENUMS are created under the "logiq" schema (via pgSchema in definitions).
 * - The migrations journal is stored in the "public" schema to avoid CREATE SCHEMA operations.
 */
export async function runMigrations(): Promise<void> {
  try {
    await migrate(db, {
      migrationsFolder: 'drizzle',
      migrationsTable: '__drizzle_migrations',
      migrationsSchema: 'public',
    });
    console.log('[db] Drizzle migrations applied successfully');
  } catch (err) {
    // Do not crash the app in dev; surface error for visibility
    console.error('[db] Drizzle migration error:', err);
  }
}

export default runMigrations;
