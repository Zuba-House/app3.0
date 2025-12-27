# Quick fix for Expo Metro error

Write-Host "🔧 Fixing Expo setup..." -ForegroundColor Yellow

# Remove problematic packages
Write-Host "`nRemoving manual Metro packages..." -ForegroundColor Cyan
npm uninstall metro metro-cache metro-config metro-resolver metro-runtime

# Clean
Write-Host "`nCleaning..." -ForegroundColor Cyan
if (Test-Path node_modules) { Remove-Item -Recurse -Force node_modules }
if (Test-Path package-lock.json) { Remove-Item -Force package-lock.json }
npm cache clean --force

# Reinstall
Write-Host "`nReinstalling (this takes a few minutes)..." -ForegroundColor Cyan
npm install

Write-Host "`n✅ Done! Now run: npm start" -ForegroundColor Green

