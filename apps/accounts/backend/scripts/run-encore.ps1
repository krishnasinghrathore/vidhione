# Helper to run Encore with required env vars set (PowerShell).
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Join-Path $root ".." | Resolve-Path
Set-Location $root

if (-not $Env:AGENCY_DB_URL) {
  $Env:AGENCY_DB_URL = "postgres://migration_user:migration%40123456@192.168.31.8:5432/agency_db"
}
if (-not $Env:ENCORE_NODE_MODULES) {
  $Env:ENCORE_NODE_MODULES = Join-Path $root "node_modules"
}

encore run
