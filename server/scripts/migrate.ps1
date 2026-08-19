param (
    [string]$Action = "up",
    [string]$DbUrl = "postgres://fluids_admin:fluids_password@127.0.0.1:5436/fluids_db?sslmode=disable"
)

$basePath = "server/internal/modules"
if (-not (Test-Path $basePath)) {
    $basePath = "internal/modules"
}

$migrationFolders = Get-ChildItem -Path $basePath -Recurse -Directory -Filter "migrations"

Write-Host "[INFO] Found $($migrationFolders.Count) module migration folders..." -ForegroundColor Cyan

foreach ($folder in $migrationFolders) {
    $sqlFiles = Get-ChildItem -Path $folder.FullName -Filter "*.sql"
    if ($sqlFiles.Count -gt 0) {
        $cleanPath = $folder.FullName.Replace("\", "/")
        
        $moduleName = "default"
        if ($cleanPath -match "modules/([^/]+)") {
            $moduleName = $Matches[1]
        }
        
        $sep = if ($DbUrl.Contains("?")) { "&" } else { "?" }
        $moduleDbUrl = "${DbUrl}${sep}x-migrations-table=schema_migrations_${moduleName}"
        
        Write-Host "[MIGRATE] Running [$Action] for module [$moduleName] -> $cleanPath" -ForegroundColor Yellow
        migrate -path "$cleanPath" -database "$moduleDbUrl" $Action
    }
}

Write-Host "[SUCCESS] All module database migrations completed!" -ForegroundColor Green