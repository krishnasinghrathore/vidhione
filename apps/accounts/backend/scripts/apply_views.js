#!/usr/bin/env node
/**
 * Apply the legacy-compat views to agency_db using pg.
 *
 * Usage:
 *   node scripts/apply_views.js --url "postgres://user:pass@host:5432/agency_db"
 *   # optionally override the SQL file
 *   node scripts/apply_views.js --url "...agency_db" --file "../src/db/sql/views_legacy_accounts.sql"
 *
 * Defaults:
 *   - connection string from AGENCY_DB_URL env var
 *   - SQL file: ../src/db/sql/views_legacy_accounts.sql (relative to this script)
 *
 * Requires: pg (already in this package)
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { url: process.env.AGENCY_DB_URL, file: resolve(__dirname, '../src/db/sql/views_legacy_accounts.sql') };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      out.url = args[i + 1];
      i++;
    } else if (args[i] === '--file' && args[i + 1]) {
      out.file = resolve(args[i + 1]);
      i++;
    }
  }
  if (!out.url) {
    throw new Error('Missing connection string. Set AGENCY_DB_URL or pass --url "postgres://user:pass@host:5432/agency_db"');
  }
  return out;
}

async function main() {
  const { url, file } = parseArgs();
  const sql = readFileSync(file, 'utf8');
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    console.log(`Applying SQL from ${file} to ${url}`);
    await client.query(sql);
    console.log('Views applied successfully.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
