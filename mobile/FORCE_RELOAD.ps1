# Force Reload Script - Complete App Restart
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FORCE RELOAD - Complete App Restart" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to mobile directory
Set-Location $PSScriptRoot

Write-Host "[1/4] Stopping Metro bundler..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "[2/4] Clearing all caches..." -ForegroundColor Yellow
if (Test-Path ".expo") { Remove-Item -Recurse -Force ".expo" }
if (Test-Path "node_modules\.cache") { Remove-Item -Recurse -Force "node_modules\.cache" }
if (Test-Path ".metro") { Remove-Item -Recurse -Force ".metro" }
Write-Host "Cache cleared!" -ForegroundColor Green

Write-Host "[3/4] Starting Metro with clear cache..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm start -- --clear"

Write-Host "[4/4] Waiting for Metro to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DONE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now in your app:" -ForegroundColor Yellow
Write-Host "1. Shake device (or press Ctrl+M on emulator)" -ForegroundColor White
Write-Host "2. Select 'Reload'" -ForegroundColor White
Write-Host ""
Write-Host "OR press 'r' in the Metro terminal to reload" -ForegroundColor White
Write-Host ""
