#!/usr/bin/env bash
# Dump key Accounts schema definitions from agency_db to stdout.
# Usage:
#   AGENCY_DB_URL="postgres://user:pass@host:5432/agency_db" ./dump_agency_accounts_schema.sh
# Requires: psql installed and reachable host.

set -euo pipefail

PSQL_URL="${AGENCY_DB_URL:-}"

if [[ -z "${PSQL_URL}" ]]; then
  echo "Set AGENCY_DB_URL (e.g., postgres://migration_user:migration%40123456@192.168.31.8:5432/agency_db)" >&2
  exit 1
fi

TABLES=(
  "accounts.ledgers"
  "accounts.ledger_groups"
  "accounts.voucher_types"
  "accounts.voucher_postings"
  "accounts.ledger_balances"
  "accounts.ledger_year_balances"
  "accounts.money_receipt_cash_headers"
  "accounts.money_receipt_cash_lines"
  "accounts.money_receipt_bank_headers"
  "accounts.money_receipt_bank_lines"
  "accounts.sales_voucher_headers"
  "accounts.sales_voucher_tax_adjustments"
  "accounts.voucher_postings"
)

echo "== Schema: accounts.* (tables) ==" >&2
psql "${PSQL_URL}" -c "\dt accounts.*" || true
echo

for tbl in "${TABLES[@]}"; do
  echo "== ${tbl} ==" >&2
  psql "${PSQL_URL}" -c "\\d ${tbl}" || true
  echo
done
