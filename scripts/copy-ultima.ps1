param(
    [string]$SourcePath = "C:\Users\KRISHNA\OneDrive\Documents\Krishna-Work\InterProModal\References\ultima-react-10.1.0",
    [string]$AppRoot = "apps/auth-admin/frontend"
)

$ErrorActionPreference = 'Stop'

function New-Dir {
    param([string]$Path)
    if (-not (Test-Path $Path)) { New-Item -ItemType Directory -Force -Path $Path | Out-Null }
}

# Validate source
if (-not (Test-Path $SourcePath)) {
    Write-Error "Ultima source not found at: $SourcePath"
}

$destSrcUltima = Join-Path $AppRoot "src\ultima"
$destThemeDir = Join-Path $destSrcUltima "theme"
$destLayoutDir = Join-Path $destSrcUltima "layout"
$destPublicUltima = Join-Path $AppRoot "public\ultima"
New-Dir $destSrcUltima
New-Dir $destThemeDir
New-Dir $destLayoutDir
New-Dir $destPublicUltima

# Typical Ultima React template structure guesses:
# - theme CSS/SCSS (e.g., theme.css or *.scss)
# - layout styles/assets (css/scss/images)
# - public assets (images, logos, etc.)
# These may vary; we copy broadly but safely.

$possibleThemePaths = @(
    (Join-Path $SourcePath "src\assets\themes"),
    (Join-Path $SourcePath "src\assets\styles\themes"),
    (Join-Path $SourcePath "src\styles\themes"),
    (Join-Path $SourcePath "src\assets\layout\themes"),
    (Join-Path $SourcePath "public\themes")
)

$possibleLayoutPaths = @(
    (Join-Path $SourcePath "src\assets\layout"),
    (Join-Path $SourcePath "src\layout"),
    (Join-Path $SourcePath "src\styles\layout")
)

$possiblePublicPaths = @(
    (Join-Path $SourcePath "public\images"),
    (Join-Path $SourcePath "public\assets"),
    (Join-Path $SourcePath "public\layout"),
    (Join-Path $SourcePath "public\ultima")
)

function Copy-IfExists {
    param([string]$From, [string]$To)
    if (Test-Path $From) {
        Write-Host "Copying $From -> $To"
        New-Dir $To
        Copy-Item -Recurse -Force -Path (Join-Path $From "*") -Destination $To
        return $true
    }
    return $false
}

$themeCopies = 0
foreach ($p in $possibleThemePaths) { if (Copy-IfExists -From $p -To $destThemeDir) { $themeCopies++ } }
$layoutCopies = 0
foreach ($p in $possibleLayoutPaths) { if (Copy-IfExists -From $p -To $destLayoutDir) { $layoutCopies++ } }
$publicCopies = 0
foreach ($p in $possiblePublicPaths) { if (Copy-IfExists -From $p -To $destPublicUltima) { $publicCopies++ } }

Write-Host "Ultima copy results - theme:$themeCopies, layout:$layoutCopies, public:$publicCopies"
Write-Host "Next: Vite will auto-import any CSS/SCSS under src/ultima via import.meta.glob in src/main.tsx."