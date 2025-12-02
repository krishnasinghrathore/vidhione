import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, PoolConfig } from 'pg';

const resolveConnectionString = () => {
  const value =
    process.env.AGENCY_DB_URL ??
    process.env.ACCOUNTS_DB_URL ??
    process.env.DATABASE_URL;

  if (!value) {
    throw new Error(
      'Missing PostgreSQL connection string. Set AGENCY_DB_URL / ACCOUNTS_DB_URL / DATABASE_URL in the Encore service config.'
    );
  }

  return value;
};

const makePool = () => {
  const config: PoolConfig = { connectionString: resolveConnectionString() };

  if (process.env.PGSSL === '1') {
    config.ssl = { rejectUnauthorized: false };
  }

  return new Pool(config);
};

export const pool = makePool();
export const db = drizzle(pool, {
  logger: process.env.DRIZZLE_DEBUG === '1'
});
