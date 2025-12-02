$ErrorActionPreference = 'Stop'

$root = 'apps/auth-admin/frontend'
$src = Join-Path $root 'src'
$public = Join-Path $root 'public'

New-Item -ItemType Directory -Force -Path $root | Out-Null
New-Item -ItemType Directory -Force -Path $src | Out-Null
New-Item -ItemType Directory -Force -Path $public | Out-Null

$pkg = @'
{
  "name": "@vidhione/auth-admin-frontend",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview --open"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.5.0",
    "vite": "^5.2.0"
  }
}
'@
Set-Content -Path (Join-Path $root 'package.json') -Value $pkg -Encoding UTF8

$tsconfig = @'
{
  "extends": "./tsconfig.node.json",
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "jsx": "react-jsx",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
'@
Set-Content -Path (Join-Path $root 'tsconfig.json') -Value $tsconfig -Encoding UTF8

$tsnode = @'
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "types": ["vite/client"]
  },
  "include": ["vite.config.ts"]
}
'@
Set-Content -Path (Join-Path $root 'tsconfig.node.json') -Value $tsnode -Encoding UTF8

$vite = @'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  }
})
'@
Set-Content -Path (Join-Path $root 'vite.config.ts') -Value $vite -Encoding UTF8

$html = @'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vidhione Auth Admin</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
'@
Set-Content -Path (Join-Path $root 'index.html') -Value $html -Encoding UTF8

$main = @'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
'@
Set-Content -Path (Join-Path $src 'main.tsx') -Value $main -Encoding UTF8

$app = @'
export default function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1>Auth Admin</h1>
        <p>Clean Vite + React + TS scaffold ready for Ultima theme.</p>
      </header>
      <main className="app__main">
        <ul>
          <li>Tenant/org management</li>
          <li>User provisioning and invites</li>
          <li>Token generation</li>
        </ul>
      </main>
    </div>
  )
}
'@
Set-Content -Path (Join-Path $src 'App.tsx') -Value $app -Encoding UTF8

$css = @'
:root {
  color-scheme: light dark;
  --bg: #0b0b0c;
  --fg: #eaeaea;
}

* { box-sizing: border-box; }
html, body, #root { height: 100%; margin: 0; padding: 0; }
body { font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; }

.app { padding: 24px; }
.app__header { margin-bottom: 16px; }
.app__main { padding: 12px; border: 1px dashed #888; border-radius: 8px; }
'@
Set-Content -Path (Join-Path $src 'index.css') -Value $css -Encoding UTF8

$robots = @'
User-agent: *
Disallow:
'@
Set-Content -Path (Join-Path $public 'robots.txt') -Value $robots -Encoding UTF8

$readme = @'
# Auth Admin (React + Vite + TS)

This is the admin UI scaffold for managing clients/orgs, users, and token generation.

Commands:
- Install deps: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Preview: `pnpm preview`

Ultima theme integration: drop the theme assets and styles, then wire components.
'@
Set-Content -Path (Join-Path $root 'README.md') -Value $readme -Encoding UTF8