import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schemas',
  out: './src/drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.AGENCY_DB_URL ?? ''
  }
} satisfies Config;
