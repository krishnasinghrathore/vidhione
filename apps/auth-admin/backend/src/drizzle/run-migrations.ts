import runMigrations from './migrate';

// Run migrations using app migrator configured for public schema (no CREATE SCHEMA needed)
await runMigrations();

console.log('[db] Migrations completed via app migrator (public schema journal)');
