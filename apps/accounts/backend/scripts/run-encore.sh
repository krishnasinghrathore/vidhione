#!/usr/bin/env bash
# Helper to run Encore with required env vars set.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Defaults; override by exporting before running if needed.
export AGENCY_DB_URL="${AGENCY_DB_URL:-postgres://migration_user:migration%40123456@192.168.31.8:5432/agency_db}"
export ENCORE_NODE_MODULES="${ENCORE_NODE_MODULES:-$ROOT/node_modules}"

exec npm run encore:run -- "$@"
