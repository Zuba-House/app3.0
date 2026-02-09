# PowerShell script to restart Vendor and Client apps
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Restarting Vendor and Client Apps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Current directory: $scriptPath" -ForegroundColor Yellow
Write-Host ""

# Stop any running Node processes
Write-Host "Stopping any running Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start Vendor Dashboard
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Vendor Dashboard..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$vendorPath = Join-Path $scriptPath "vendor"
if (-not (Test-Path (Join-Path $vendorPath "package.json"))) {
    Write-Host "ERROR: vendor/package.json not found!" -ForegroundColor Red
    Write-Host "Path checked: $vendorPath" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Set-Location $vendorPath
Write-Host "Installing dependencies if needed..." -ForegroundColor Yellow
npm install 2>&1 | Out-Null
Write-Host "Starting dev server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$vendorPath'; npm run dev"

Start-Sleep -Seconds 3

# Start Client App
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Client App..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$clientPath = Join-Path $scriptPath "client"
if (-not (Test-Path (Join-Path $clientPath "package.json"))) {
    Write-Host "ERROR: client/package.json not found!" -ForegroundColor Red
    Write-Host "Path checked: $clientPath" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Set-Location $clientPath
Write-Host "Installing dependencies if needed..." -ForegroundColor Yellow
npm install 2>&1 | Out-Null
Write-Host "Starting dev server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$clientPath'; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Both apps are starting!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Yellow
Write-Host "1. Check the new PowerShell windows that opened" -ForegroundColor White
Write-Host "2. Wait for servers to start (look for 'Local: http://localhost:XXXX')" -ForegroundColor White
Write-Host "3. Open browser and go to the URLs shown" -ForegroundColor White
Write-Host "4. Press Ctrl+Shift+R to hard refresh (clear cache)" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to close"
