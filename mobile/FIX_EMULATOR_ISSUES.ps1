# 🔧 Fix Mobile App Emulator Issues
# Run this script to fix common issues preventing the app from running

Write-Host "🔍 Checking current status..." -ForegroundColor Cyan

# Check Node version
$nodeVersion = node --version
Write-Host "Node version: $nodeVersion" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the mobile directory." -ForegroundColor Red
    exit 1
}

Write-Host "`n📦 Step 1: Cleaning old files..." -ForegroundColor Cyan

# Remove node_modules
if (Test-Path "node_modules") {
    Write-Host "Removing node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
}

# Remove lock file
if (Test-Path "package-lock.json") {
    Write-Host "Removing package-lock.json..." -ForegroundColor Yellow
    Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
}

# Remove .expo folder
if (Test-Path ".expo") {
    Write-Host "Removing .expo folder..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
}

# Remove Android build artifacts
if (Test-Path "android\app\build") {
    Write-Host "Removing Android build artifacts..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force android\app\build -ErrorAction SilentlyContinue
}

if (Test-Path "android\.gradle") {
    Write-Host "Removing Android .gradle..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force android\.gradle -ErrorAction SilentlyContinue
}

Write-Host "`n🧹 Step 2: Clearing npm cache..." -ForegroundColor Cyan
npm cache clean --force

Write-Host "`n📥 Step 3: Reinstalling dependencies..." -ForegroundColor Cyan
Write-Host "This may take a few minutes..." -ForegroundColor Yellow
npm install

Write-Host "`n✅ Step 4: Verifying installation..." -ForegroundColor Cyan

# Check Expo version
$expoVersion = npm list expo --depth=0 2>&1
if ($expoVersion -match "expo@") {
    Write-Host "Expo installed successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: Expo version check failed. Run 'npm list expo' manually." -ForegroundColor Yellow
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Make sure Android emulator is running (Android Studio)" -ForegroundColor White
Write-Host "2. Run: npm start" -ForegroundColor White
Write-Host "3. Press 'a' in the terminal to open on Android emulator" -ForegroundColor White
Write-Host "`nOR use physical device:" -ForegroundColor Yellow
Write-Host "1. Install Expo Go app on your phone" -ForegroundColor White
Write-Host "2. Make sure phone and computer on same WiFi" -ForegroundColor White
Write-Host "3. Run: npm start" -ForegroundColor White
Write-Host "4. Scan QR code with Expo Go app" -ForegroundColor White

Write-Host "`n✅ Cleanup complete! You can now run 'npm start'" -ForegroundColor Green
