param(
  [string]$Container = "f1_postgres",
  [string]$DbName = "f1app",
  [string]$DbUser = "f1user",
  [string]$SqlDir = "C:\Users\gergo.LOQI\projects\f1_app\postgres\driver_standings",
  [string]$Pattern = "driver_standings_*_upsert.sql"
)

$ErrorActionPreference = "Stop"

Write-Host "==> Looking for SQL files in: $SqlDir"
$files = Get-ChildItem -Path $SqlDir -Filter $Pattern | Sort-Object Name

if ($files.Count -eq 0) {
  throw "No files found with pattern: $Pattern in $SqlDir"
}

# Create target dir inside container
Write-Host "==> Ensuring /tmp/standings exists in container $Container"
docker exec $Container sh -lc "mkdir -p /tmp/standings"

# Copy all files into container
Write-Host "==> Copying $($files.Count) files into container..."
foreach ($f in $files) {
  $dest = "/tmp/standings/$($f.Name)"
  docker cp $f.FullName "${Container}:$dest"
}

# Run them in sorted order inside container (important: do NOT pipe Get-Content)
Write-Host "==> Running SQL files in container..."
foreach ($f in $files) {
  $pathInContainer = "/tmp/standings/$($f.Name)"
  Write-Host "----> Executing $($f.Name)"

  docker exec -i $Container psql `
    -U $DbUser `
    -d $DbName `
    -v ON_ERROR_STOP=1 `
    -c "SET client_encoding TO 'UTF8';" | Out-Null

  docker exec -i $Container psql `
    -U $DbUser `
    -d $DbName `
    -v ON_ERROR_STOP=1 `
    -f $pathInContainer
}

Write-Host "✅ Done. Loaded $($files.Count) SQL files into $DbName."
