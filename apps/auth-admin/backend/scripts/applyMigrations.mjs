/* ESM migration runner (because backend/package.json uses "type": "module")
 * Applies SQL migrations using node-postgres.
 *
 * Usage from repo root:
 *   node backend/scripts/applyMigrations.mjs
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env for DATABASE_URL
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function readSql(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (err) {
    throw new Error(`Cannot read SQL file: ${filePath} (${err.message})`);
  }
}

async function applySql(client, sql, label) {
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('COMMIT');
    console.log(`Applied: ${label}`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw new Error(`Failed applying ${label}: ${err.message}`);
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not set. Please configure backend/.env');
    process.exit(1);
  }

  const migrations = [
    // Clean up any orphaned vehicle.driver_id before adding FK
    path.resolve(__dirname, '../drizzle/0001_5_cleanup_vehicle_driver_refs.sql'),
    // Add FK and then create system_config table
    path.resolve(__dirname, '../drizzle/0002_add_vehicle_driver_fk.sql'),
    path.resolve(__dirname, '../drizzle/0003_create_system_config.sql'),
    // Add maintenance completion types master and FK on maintenance_records
    path.resolve(__dirname, '../drizzle/0004_add_maintenance_completion_types.sql'),
    // Rename label->name and drop code on maintenance_completion_types
    path.resolve(__dirname, '../drizzle/0005_rename_label_to_name_drop_code.sql'),
    // Document types master and documents storage
    path.resolve(__dirname, '../drizzle/0006_add_document_types.sql'),
  ];

  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    console.log('Connected to database.');

    for (const m of migrations) {
      const sql = await readSql(m);
      console.log(`Applying migration: ${path.basename(m)}`);
      await applySql(client, sql, path.basename(m));
    }

    console.log('All migrations applied successfully.');
    process.exit(0);
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  } finally {
    try {
      await client.end();
    } catch {}
  }
}

main();
