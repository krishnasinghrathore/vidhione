# Accounts Backend (Encore + Drizzle)

This service hosts the GraphQL/Encore endpoints for the SaaS accounting module. It shares the monorepo tooling in the `vidhione/` workspace and uses Drizzle ORM plus the `pg` driver for PostgreSQL.

## Environment variables

Set one of the following connection strings before running Encore locally or in CI:

- `AGENCY_DB_URL` – preferred; points to the tenant-aware `agency_db` database.
- `ACCOUNTS_DB_URL` – optional alias if we split read/write traffic later.
- `DATABASE_URL` – fallback shared by other services.

Additional flags:

- `PGSSL=1` to enable SSL (uses `rejectUnauthorized: false` for managed Postgres providers that require encryption but expose self-signed certs).
- `DRIZZLE_DEBUG=1` to log SQL statements for troubleshooting.

If none of the connection string env vars are present, `src/db/client.ts` throws at startup to avoid silent misconfiguration.

## Installing dependencies

Run `npm install` (or `pnpm install`) from the repository root or from `vidhione/`. The dev shell currently warns "WSL 1 is not supported", so please execute the install step from WSL 2 or directly in Windows to regenerate `package-lock.json` with the new `drizzle-orm` dependency.

## Next steps

1. Define Drizzle schema modules under `src/db/schemas/` that mirror the `agency_db` tables / materialized views needed for ledger, trial balance, GST, etc.
2. Create GraphQL modules (e.g., `src/graphql/ledger.ts`) that import the shared `db` client and expose typed queries for the frontend.
3. Wire Encore endpoints to these modules so multi-tenant context (company, year) flows through every resolver.
4. Add unit tests around the data mappers once Drizzle schemas exist (Encore supports bringing its own test runner, or use Vitest in the workspace).
