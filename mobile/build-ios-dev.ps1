# Build Zuba House iOS dev client (Stripe in-app payments).
# Run from this folder (mobile/) — do NOT run "cd mobile" again.
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host "Checking Expo config..."
npx expo config --json | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw "Expo config failed. Fix app.json / app.config.js first."
}

Write-Host "Starting EAS build (development-store profile)..."
eas build --profile development-store --platform ios --non-interactive
