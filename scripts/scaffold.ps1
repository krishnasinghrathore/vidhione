$ErrorActionPreference = 'Stop'

$dirs = @(
  'apps/retail/frontend',
  'apps/retail/backend',
  'apps/restaurant/frontend',
  'apps/restaurant/backend',
  'apps/textile/frontend',
  'apps/textile/backend',
  'apps/agency/frontend',
  'apps/agency/backend',
  'apps/accounts/frontend',
  'apps/accounts/backend',
  'apps/auth-admin/frontend',
  'services/auth/services',
  'services/auth/pkg',
  'packages/ui',
  'packages/config',
  'packages/shared-types',
  'packages/sdk',
  'packages/eslint-config'
)

foreach ($d in $dirs) {
  New-Item -ItemType Directory -Force -Path $d | Out-Null
  $keep = Join-Path $d '.gitkeep'
  if (-not (Test-Path $keep)) { New-Item -ItemType File -Force -Path $keep | Out-Null }
}

$ws = @"
packages:
  - apps/*/*
  - services/*
  - packages/*
"@
Set-Content -Path 'pnpm-workspace.yaml' -Value $ws -Encoding UTF8

$encore = @"
import { App } from 'encore.dev/app';

export default new App('auth', {
  description: 'Common Encore TS Auth service (SSO, orgs, invites)'
});
"@
New-Item -ItemType Directory -Force -Path 'services/auth' | Out-Null
Set-Content -Path 'services/auth/encore.app.ts' -Value $encore -Encoding UTF8