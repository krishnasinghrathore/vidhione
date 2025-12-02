import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import fs from 'fs';
import config from '../src/drizzle/drizzle.config';

const connectionString = process.env.AGENCY_DB_URL;

if (!connectionString) {
  console.error('Missing AGENCY_DB_URL');
  process.exit(1);
}

// Ensure migration folder exists
if (!fs.existsSync('./src/drizzle/migrations')) {
  fs.mkdirSync('./src/drizzle/migrations', { recursive: true });
}

const pool = new Pool({ connectionString });
const db = drizzle(pool);

async function main() {
  await migrate(db, { migrationsFolder: config.out });
  await pool.end();
  console.log('Migrations completed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
