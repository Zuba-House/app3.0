# Fix Axios Crypto Error and Expo SDK Mismatch

Write-Host "Fixing Axios and Expo SDK Issues..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Step 1: Remove axios
Write-Host "`nStep 1: Removing axios (not compatible with React Native)..." -ForegroundColor Yellow
npm uninstall axios

# Step 2: Upgrade Expo to SDK 54
Write-Host "`nStep 2: Upgrading Expo to SDK 54..." -ForegroundColor Yellow
npm install expo@~54.0.0

# Step 3: Update Expo dependencies
Write-Host "`nStep 3: Updating Expo dependencies..." -ForegroundColor Yellow
npx expo install --fix

# Step 4: Clean and reinstall
Write-Host "`nStep 4: Cleaning build artifacts..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
}
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
}

Write-Host "`nStep 5: Reinstalling dependencies..." -ForegroundColor Yellow
npm install

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "All fixes applied!" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. The API client has been updated to use fetch (React Native compatible)" -ForegroundColor White
Write-Host "2. Expo has been upgraded to SDK 54 (matches Expo Go)" -ForegroundColor White
Write-Host "3. Run: npm start" -ForegroundColor White
Write-Host "4. Press 'a' for Android emulator" -ForegroundColor White
Write-Host "`nThe app should now work with Expo Go!" -ForegroundColor Green
