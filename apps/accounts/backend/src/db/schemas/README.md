# Drizzle schemas (accounts backend)

Define PostgreSQL tables/views here to mirror the legacy stored-proc result sets. As we port each WinForms form, create the corresponding schema modules and export them from `index.ts`.

Suggested mapping approach:
- **Display/report forms**: create SQL views/materialized views that reproduce the legacy `Select_*` outputs (column names/types preserved), then map them with Drizzle `pgTable`/`view`.
- **Masters/transactions**: define normalized tables that match the new SaaS schema and expose compatibility views if the UI expects legacy column aliases.
- **Shared filters** (e.g., `Select_LedgerMaster_Spl`): model them as reusable views or helper queries.

See `MIGRATION_PROGRESS.md` for the per-form stored procedure inventory.
