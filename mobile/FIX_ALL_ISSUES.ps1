# Fix All Mobile App Issues
# Comprehensive fix script for all known issues

Write-Host "Fixing All Mobile App Issues..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Step 1: Check Node version
Write-Host "`nStep 1: Checking Node version..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "Node version: $nodeVersion" -ForegroundColor Green
if ($nodeVersion -notmatch "v20") {
    Write-Host "Warning: Node 20.x recommended. Current: $nodeVersion" -ForegroundColor Yellow
}

# Step 2: Check if emulator is running
Write-Host "`nStep 2: Checking Android emulator..." -ForegroundColor Yellow
$devices = adb devices 2>&1
$emulatorRunning = $devices -match "emulator.*device"
if ($emulatorRunning) {
    Write-Host "Android emulator detected!" -ForegroundColor Green
} else {
    Write-Host "No Android emulator detected. Start emulator before running app." -ForegroundColor Yellow
}

# Step 3: Clean everything
Write-Host "`nStep 3: Cleaning build artifacts..." -ForegroundColor Yellow

$itemsToRemove = @(
    "node_modules",
    "package-lock.json",
    ".expo",
    "android\.gradle",
    "android\app\build",
    "android\build",
    "android\app\.cxx"
)

foreach ($item in $itemsToRemove) {
    if (Test-Path $item) {
        Write-Host "  Removing: $item" -ForegroundColor Gray
        Remove-Item -Recurse -Force $item -ErrorAction SilentlyContinue
    }
}

# Step 4: Clear caches
Write-Host "`nStep 4: Clearing caches..." -ForegroundColor Yellow
npm cache clean --force | Out-Null
Write-Host "npm cache cleared" -ForegroundColor Green

# Step 5: Add missing dev dependencies
Write-Host "`nStep 5: Installing/updating dependencies..." -ForegroundColor Yellow

# Check if @types/jest is needed
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$hasJestTypes = $packageJson.devDependencies.PSObject.Properties.Name -contains "@types/jest"

if (-not $hasJestTypes) {
    Write-Host "  Adding @types/jest for TypeScript..." -ForegroundColor Gray
    npm install --save-dev @types/jest --silent
}

# Step 6: Reinstall all dependencies
Write-Host "  Reinstalling all dependencies (this may take a few minutes)..." -ForegroundColor Gray
npm install

# Step 7: Verify Expo version
Write-Host "`nStep 6: Verifying Expo version..." -ForegroundColor Yellow
$expoCheck = npm list expo --depth=0 2>&1
if ($expoCheck -match "expo@50") {
    Write-Host "Expo version correct: expo@50.x.x" -ForegroundColor Green
} elseif ($expoCheck -match "invalid") {
    Write-Host "Expo version mismatch detected!" -ForegroundColor Red
    Write-Host "  Fixing Expo version..." -ForegroundColor Yellow
    npm install expo@~50.0.0 --save
    npm install
} else {
    Write-Host "Expo version check: $expoCheck" -ForegroundColor Yellow
}

# Step 8: Check for missing dependencies
Write-Host "`nStep 7: Checking for missing dependencies..." -ForegroundColor Yellow
$missingDeps = npm list --depth=0 2>&1 | Select-String "UNMET DEPENDENCY"
if ($missingDeps) {
    Write-Host "Missing dependencies found. Reinstalling..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "All dependencies installed" -ForegroundColor Green
}

# Step 9: Verify TypeScript
Write-Host "`nStep 8: Checking TypeScript configuration..." -ForegroundColor Yellow
if (Test-Path "tsconfig.json") {
    Write-Host "TypeScript config found" -ForegroundColor Green
} else {
    Write-Host "TypeScript config missing" -ForegroundColor Yellow
}

# Step 10: Check Android setup
Write-Host "`nStep 9: Checking Android setup..." -ForegroundColor Yellow
if (Test-Path "android") {
    Write-Host "Android folder exists" -ForegroundColor Green
} else {
    Write-Host "Android folder missing. Run: npx expo prebuild" -ForegroundColor Yellow
}

# Step 11: Check app.json
Write-Host "`nStep 10: Checking app configuration..." -ForegroundColor Yellow
if (Test-Path "app.json") {
    Write-Host "app.json found" -ForegroundColor Green
} else {
    Write-Host "app.json missing!" -ForegroundColor Red
}

# Summary
Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "All fixes applied!" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Make sure Android emulator is running" -ForegroundColor White
Write-Host "2. Run: npm run android:auto" -ForegroundColor White
Write-Host "   OR: npx expo start --android" -ForegroundColor White
Write-Host "`nThe app will automatically launch on your emulator!" -ForegroundColor Green
