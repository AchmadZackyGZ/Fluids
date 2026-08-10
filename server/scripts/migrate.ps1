param (
    [string]$Action = "up",
    [string]$DbUrl = "postgres://fluids_admin:fluids_password@127.0.0.1:5436/fluids_db?sslmode=disable"
)

$migrationFolders = Get-ChildItem -Path "server/internal/modules" -Recurse -Directory -Filter "migrations"

Write-Host "[INFO] Found $($migrationFolders.Count) module migration folders..." -ForegroundColor Cyan

foreach ($folder in $migrationFolders) {
    $sqlFiles = Get-ChildItem -Path $folder.FullName -Filter "*.sql"
    if ($sqlFiles.Count -gt 0) {
        $cleanPath = $folder.FullName.Replace("\", "/")
        Write-Host "[MIGRATE] Running [$Action] -> $cleanPath" -ForegroundColor Yellow
        migrate -path "$cleanPath" -database "$DbUrl" $Action
    }
}

Write-Host "[SUCCESS] All module database migrations completed!" -ForegroundColor Green