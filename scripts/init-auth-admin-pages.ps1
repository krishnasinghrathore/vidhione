$ErrorActionPreference = 'Stop'

$pagesDir = 'apps/auth-admin/frontend/src/pages'
New-Item -ItemType Directory -Force -Path $pagesDir | Out-Null

# Dashboard.tsx
$dashboard = @'
import { Card } from 'primereact/card';

export default function Dashboard() {
  return (
    <div className="p-3">
      <Card title="Dashboard">
        <p>Welcome to Auth Admin. Use the menu to navigate between sections.</p>
      </Card>
    </div>
  );
}
'@
Set-Content -Path (Join-Path $pagesDir 'Dashboard.tsx') -Value $dashboard -Encoding UTF8

# Tenants.tsx
$tenants = @'
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

export default function Tenants() {
  return (
    <div className="p-3">
      <Card title="Tenants / Organizations" subTitle="Manage client orgs">
        <div className="flex gap-2">
          <Button icon="pi pi-plus" label="Create Tenant" />
          <Button icon="pi pi-refresh" label="Refresh" severity="secondary" outlined />
        </div>
        <p className="mt-3">Listing coming soon…</p>
      </Card>
    </div>
  );
}
'@
Set-Content -Path (Join-Path $pagesDir 'Tenants.tsx') -Value $tenants -Encoding UTF8

# Users.tsx
$users = @'
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

export default function Users() {
  return (
    <div className="p-3">
      <Card title="Users / Invites" subTitle="Provision users and send invites">
        <div className="flex gap-2">
          <Button icon="pi pi-user-plus" label="Invite User" />
          <Button icon="pi pi-envelope" label="Resend Invites" severity="secondary" outlined />
        </div>
        <p className="mt-3">Users table coming soon…</p>
      </Card>
    </div>
  );
}
'@
Set-Content -Path (Join-Path $pagesDir 'Users.tsx') -Value $users -Encoding UTF8

# Tokens.tsx
$tokens = @'
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

export default function Tokens() {
  return (
    <div className="p-3">
      <Card title="Token Generation" subTitle="Issue short-lived admin tokens">
        <div className="flex gap-2">
          <Button icon="pi pi-key" label="Generate Token" />
          <Button icon="pi pi-copy" label="Copy" severity="secondary" outlined />
        </div>
        <p className="mt-3">Token details and history coming soon…</p>
      </Card>
    </div>
  );
}
'@
Set-Content -Path (Join-Path $pagesDir 'Tokens.tsx') -Value $tokens -Encoding UTF8

# NotFound.tsx
$notFound = @'
export default function NotFound() {
  return (
    <div className="p-5">
      <h2>404</h2>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
}
'@
Set-Content -Path (Join-Path $pagesDir 'NotFound.tsx') -Value $notFound -Encoding UTF8