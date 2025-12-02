import { api } from 'encore.dev/api';
import { pool } from './drizzle/client';

export interface HealthzResponse {
  status: 'ok';
  db: 'ok';
  version: string;
}

export const healthz = api<void, HealthzResponse>(
  { path: '/healthz', method: 'GET', expose: true },
  async (): Promise<HealthzResponse> => {
    const version = String(
      process.env.GIT_SHA ||
        process.env.TAG ||
        process.env.VERCEL_GIT_COMMIT_SHA ||
        process.env.COMMIT_SHA ||
        process.env.GITHUB_SHA ||
        'unknown'
    );

    try {
      await pool.query('select 1');
    } catch {
      throw new Error('database connectivity check failed');
    }

    return { status: 'ok', db: 'ok', version };
  }
);