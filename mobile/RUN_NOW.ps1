# PowerShell script to fix and run the mobile app

Write-Host "🔧 Fixing Metro/Expo issues..." -ForegroundColor Yellow

# Navigate to mobile directory
Set-Location $PSScriptRoot

# Step 1: Remove problematic Metro packages
Write-Host "`n📦 Removing manual Metro packages..." -ForegroundColor Cyan
npm uninstall metro metro-cache metro-config metro-resolver metro-runtime 2>&1 | Out-Null

# Step 2: Clean
Write-Host "`n🧹 Cleaning node_modules and cache..." -ForegroundColor Cyan
if (Test-Path node_modules) {
    Remove-Item -Recurse -Force node_modules
}
if (Test-Path package-lock.json) {
    Remove-Item -Force package-lock.json
}
npm cache clean --force 2>&1 | Out-Null

# Step 3: Reinstall
Write-Host "`n📥 Reinstalling dependencies (this may take a few minutes)..." -ForegroundColor Cyan
npm install

# Step 4: Start Expo
Write-Host "`n🚀 Starting Expo..." -ForegroundColor Green
Write-Host "`nPress 'a' for Android emulator" -ForegroundColor Yellow
Write-Host "OR scan QR code with Expo Go app on your phone`n" -ForegroundColor Yellow

npm start

