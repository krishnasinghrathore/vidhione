$ErrorActionPreference = 'Stop'

# Generate Encore app descriptors for each vertical backend
$verticals = @('retail','restaurant','textile','agency','accounts')

foreach ($v in $verticals) {
  $dir = "apps/$v/backend"
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $tmpl = @'
import { App } from 'encore.dev/app';

export default new App('REPLACENAME', {
  description: 'Encore TS app backend for REPLACENAME'
});
'@
  $content = $tmpl -replace 'REPLACENAME', $v
  Set-Content -Path "$dir/encore.app.ts" -Value $content -Encoding UTF8
}

# Auth service stubs
New-Item -ItemType Directory -Force -Path 'services/auth/services' | Out-Null

$users = @'
/**
 * Placeholder for users service.
 * TODO: Implement with Encore service definitions.
 */
export type User = { id: string; email: string };
export const usersPlaceholder = true;
'@
Set-Content -Path 'services/auth/services/users.ts' -Value $users -Encoding UTF8

$sessions = @'
/**
 * Placeholder for sessions service.
 * TODO: Implement with Encore service definitions.
 */
export type Session = { id: string; userId: string };
export const sessionsPlaceholder = true;
'@
Set-Content -Path 'services/auth/services/sessions.ts' -Value $sessions -Encoding UTF8

$orgs = @'
/**
 * Placeholder for orgs service.
 * TODO: Implement with Encore service definitions.
 */
export type Org = { id: string; name: string };
export const orgsPlaceholder = true;
'@
Set-Content -Path 'services/auth/services/orgs.ts' -Value $orgs -Encoding UTF8

$index = @'
export * from './users';
export * from './sessions';
export * from './orgs';
'@
Set-Content -Path 'services/auth/services/index.ts' -Value $index -Encoding UTF8