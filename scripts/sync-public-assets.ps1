$ErrorActionPreference = 'Stop'

# Source Ultima reference public assets
$src = 'references/ultima-react-10.1.0/public'

# Destination app public folders (thin hosts)
$destinations = @(
  'apps/auth-admin/frontend/public',
  'apps/retail/frontend/public',
  'apps/textile/frontend/public',
  'apps/agency/frontend/public',
  'apps/accounts/frontend/public'
)

foreach ($dest in $destinations) {
  # Ensure destination root and subfolders
  New-Item -ItemType Directory -Force -Path $dest | Out-Null
  $layoutDest = Join-Path $dest 'layout'
  $fontsDest = Join-Path $dest 'fonts'
  $ultimaDest = Join-Path $dest 'ultima'
  New-Item -ItemType Directory -Force -Path $layoutDest | Out-Null
  New-Item -ItemType Directory -Force -Path $fontsDest | Out-Null
  New-Item -ItemType Directory -Force -Path $ultimaDest | Out-Null

  # Copy layout assets (images, css) and fonts used by the layout/theme
  Copy-Item -Recurse -Force -Path (Join-Path $src 'layout') -Destination $layoutDest
  Copy-Item -Recurse -Force -Path (Join-Path $src 'layout') -Destination $ultimaDest

  if (Test-Path (Join-Path $src 'fonts')) {
    Copy-Item -Recurse -Force -Path (Join-Path $src 'fonts') -Destination $fontsDest
  }

  # Copy flags sprite required by flags.css to web root
  $flagSrc = Join-Path $src 'flags_responsive.png'
  if (Test-Path $flagSrc) {
    Copy-Item -Force -Path $flagSrc -Destination (Join-Path $dest 'flags_responsive.png')
  }

  # Copy favicon to web root from shared theme package
  $faviconSrc = 'packages/theme/src/pages/favicon.ico'
  if (Test-Path $faviconSrc) {
    Copy-Item -Force -Path $faviconSrc -Destination (Join-Path $dest 'favicon.ico')
  }

  # Normalize wrong nested paths like layout/layout and fonts/fonts
  $nestedLayout = Join-Path $layoutDest 'layout'
  if (Test-Path $nestedLayout) {
    Get-ChildItem -Force -Path $nestedLayout | ForEach-Object {
      Copy-Item -Recurse -Force -Path $_.FullName -Destination $layoutDest
    }
    Remove-Item -Recurse -Force $nestedLayout
  }

  $nestedFonts = Join-Path $fontsDest 'fonts'
  if (Test-Path $nestedFonts) {
    Get-ChildItem -Force -Path $nestedFonts | ForEach-Object {
      Copy-Item -Recurse -Force -Path $_.FullName -Destination $fontsDest
    }
    Remove-Item -Recurse -Force $nestedFonts
  }

  Write-Host "Synced and normalized public assets to $dest"
}