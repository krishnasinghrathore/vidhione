# Agent Guidelines for `vidhione/`

This repository hosts multiple apps/services (Encore backends, React/Vite frontends, and shared themes). To keep things consistent, follow these conventions when editing or adding code.

## General

- Prefer TypeScript for new code.
- Use PascalCase for React components and pages (`LedgerPage.tsx`, `HoldingsPanel.tsx`).
- Keep feature logic close to where it is used (feature folders) instead of large global utils.

## Backend (Encore TS + Drizzle + GraphQL)

- Service layout (all Encore TS services):
  - `apps/<app>/backend/src/db/schemas/*` — Drizzle table/view definitions.
  - `apps/<app>/backend/src/graphql/*` — GraphQL schema + resolvers + Encore `/graphql` endpoint wiring.
- Each backend app must maintain both `.env` and `.env.example` at the backend root, with `.env.example` containing safe sample values and comments for required variables (e.g. `WEALTH_DB_URL`, `PGSSL`, `DRIZZLE_DEBUG`).
- Always add new tables via Drizzle schemas and regenerate/migrate:
  - `npm run drizzle:generate`
  - `npm run drizzle:migrate`
- GraphQL is the only external API surface for new work:
  - Expose it via Encore at `/graphql` (typically using Apollo Server or `graphql-http`) instead of adding new REST endpoints.
  - Define the core shape and pagination in GraphQL (e.g., `*Page` types returning `{ items, meta }`).
  - If a legacy REST endpoint exists or must be added, it should be a thin wrapper delegating to the same underlying functions as the GraphQL resolvers.
- Keep Drizzle usage in a small number of data-access modules; do not sprinkle SQL across resolvers.

## Frontend (React + Vite)

For app frontends under `apps/*/frontend` (e.g., `apps/wealth/frontend`):

- Entry points:
  - `src/main.tsx` — Vite bootstrap.
  - `src/App.tsx` — wraps providers (Apollo, Router, theme) and renders routes.
- Pages:
  - Place route-level components under `src/pages/`.
  - Name pages with a `Page` suffix, e.g.:
    - `DashboardPage.tsx`
    - `HoldingsPage.tsx` (if you split Dashboard later)
  - Pages should be thin shells that compose feature components.
- Features:
  - Group domain-specific UI and logic under `src/features/<domain>/`, e.g.:
    - `src/features/holdings/HoldingsPanel.tsx`
    - `src/features/transactions/TransactionsPanel.tsx`
    - `src/features/imports/ImportPanel.tsx`
  - Co-locate GraphQL queries/mutations with the feature (`queries.ts` or alongside the panel).
- Shared utilities:
  - `src/lib/` for cross-cutting helpers:
    - GraphQL/Apollo client setup.
    - Date/number/currency formatting helpers.
  - `src/styles/` for global styles and theme tokens.
  - `src/components/` for truly shared UI (buttons, layout, tables) when needed.
- Each frontend app must maintain both `.env` and `.env.example` at the frontend root, with `.env.example` documenting keys like `VITE_GRAPHQL_URL` and any feature flags used by that app.
- UI components:
  - Prefer PrimeReact components (menus, inputs, tables, dialogs, etc.) and PrimeIcons/PrimeFlex utilities instead of custom HTML/CSS when available.
  - Use PrimeReact `Toast` for user-facing success/error notifications instead of plain text messages; keep the pattern consistent across apps.
- UI libraries:
  - Prefer PrimeReact components and PrimeIcons for new UI, following existing patterns in accounts/wealth frontends.
  - Avoid introducing additional UI libraries (e.g. alternative calendar widgets) unless there is a strong reason and it is agreed to be shared across apps.

## Forms & Validation (Zod)

- Use Zod for validating any non-trivial form or import payload.
- Pattern for forms (frontend):
  - Define a schema in `src/features/<domain>/validation.ts` or `src/validation/*`, e.g.:
    - `const importTransactionsSchema = z.object({ csv: z.string().min(1) })`.
  - Parse before submit or on change and surface errors near the fields.
- Pattern for backend (Encore/GraphQL):
  - Validate incoming arguments or parsed CSV rows with Zod before inserting/updating.
  - Prefer small, focused schemas per operation rather than one giant schema for everything.
  - Treat Zod validation errors as user-facing validation responses, not 500s.

## Wealth App Specific

- Backend:
  - Prefer:
    - `transactionsPage`, `holdingsPage`, `realizedPnlPage` for paginated lists.
    - `realizedPnlSummary`, `realizedPnlAccountSummary`, `realizedPnlDailySummary` for aggregates.
  - Corporate actions (splits/bonus/rights/dividends/capital reductions) must be registered in `corporate_actions` and are applied in-date-order on top of raw transactions.
- Frontend:
  - Root layout is `src/pages/DashboardPage.tsx`.
  - Feature panels live under `src/features/{holdings,transactions,realized,imports}/`.
  - GraphQL endpoint is configured via `VITE_GRAPHQL_URL` in the frontend `.env`.

## Accounts Frontend

- The accounts frontend currently follows the InterLogIQ / theme-host pattern, using Next-style `page.tsx` folders under `src/pages/`.
- When adding new accounts routes, follow the existing pattern in `apps/accounts/frontend/src/main.tsx` (lazy imports from `./pages/.../page`) rather than the Vite-only style.

## When in Doubt

- For new React frontends that are not theme-hosted, follow the Wealth app pattern (React + Vite + `pages/*Page.tsx` + `features/*`).
- For theme-hosted or InterLogIQ-derived apps, mirror the existing structure in that app.
