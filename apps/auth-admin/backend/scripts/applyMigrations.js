/* Apply required SQL migrations using node-postgres.
 * This script loads backend/.env to read DATABASE_URL and applies:
 *  - backend/drizzle/0002_add_vehicle_driver_fk.sql
 *  - backend/drizzle/0003_create_system_config.sql
 *
 * Usage (from repo root):
 *   node backend/scripts/applyMigrations.js
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not set. Please configure backend/.env');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();

    const files = [
      path.resolve(__dirname, '../drizzle/0002_add_vehicle_driver_fk.sql'),
      path.resolve(__dirname, '../drizzle/0003_create_system_config.sql'),
    ];

    for (const file of files) {
      if (!fs.existsSync(file)) {
        console.error(`Migration file not found: ${file}`);
        process.exit(1);
      }
      const sql = fs.readFileSync(file, 'utf8');
      console.log(`Applying migration: ${path.basename(file)}`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`Applied: ${path.basename(file)}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Failed applying ${path.basename(file)}:`, err.message);
        process.exit(1);
      }
    }

    console.log('All migrations applied successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  } finally {
    try {
      await client.end();
    } catch {}
  }
}

run();
