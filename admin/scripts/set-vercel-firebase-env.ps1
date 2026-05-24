# Run from admin/ after: npx vercel login
# Links project and sets Firebase env vars for Production, then redeploys.
# Values must match Firebase Console → zuba-house-019 → Web app "zubahouse-admin-backend"

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot + "\.."

if (-not (Test-Path ".env")) {
  Write-Error "Missing admin/.env — copy from .env.example and fill Firebase keys first."
}

Get-Content ".env" | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '^\s*VITE_') { return }
  $parts = $_ -split '=', 2
  if ($parts.Count -lt 2) { return }
  $name = $parts[0].Trim()
  $value = $parts[1].Trim()
  if ([string]::IsNullOrWhiteSpace($value)) {
    Write-Warning "Skipping empty $name"
    return
  }
  Write-Host "Setting $name (production)..."
  $value | npx vercel env add $name production --force 2>&1 | Out-Host
}

Write-Host "`nRedeploying production (no cache)..."
npx vercel --prod --force
