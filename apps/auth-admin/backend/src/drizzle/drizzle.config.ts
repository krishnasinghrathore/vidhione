import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  // Use the modular schema under src/drizzle/schemas (file-per-table)
  schema: './src/drizzle/schemas/**/*.ts',
  // Keep generated SQL migrations in backend/drizzle
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  verbose: true,
  strict: true,
});
