$ErrorActionPreference = 'Stop'

$root = 'apps/auth-admin/frontend'
$patterns = @('*.json', '*.ts', '*.tsx', '*.html', '*.css')
$files = Get-ChildItem -Path $root -Recurse -Include $patterns -File
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$removed = 0
foreach ($f in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        $text = [System.Text.Encoding]::UTF8.GetString($bytes, 3, $bytes.Length - 3)
        [System.IO.File]::WriteAllText($f.FullName, $text, $utf8NoBom)
        $removed++
    }
}
Write-Host "Processed $($files.Count) files. Removed BOM from $removed files under $root."