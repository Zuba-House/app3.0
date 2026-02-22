# 🚀 Auto-Run App on Android Emulator
# This script automatically detects emulator and launches the app

Write-Host "🔍 Checking Android emulator..." -ForegroundColor Cyan

# Check if emulator is running
$devices = adb devices 2>&1
$emulatorRunning = $devices -match "emulator.*device"

if (-not $emulatorRunning) {
    Write-Host "❌ No Android emulator detected!" -ForegroundColor Red
    Write-Host "Please start Android emulator first:" -ForegroundColor Yellow
    Write-Host "1. Open Android Studio" -ForegroundColor White
    Write-Host "2. AVD Manager → Start emulator" -ForegroundColor White
    Write-Host "3. Wait for emulator to boot" -ForegroundColor White
    Write-Host "4. Run this script again" -ForegroundColor White
    exit 1
}

Write-Host "✅ Android emulator detected!" -ForegroundColor Green
Write-Host "`n🔧 Checking Expo version..." -ForegroundColor Cyan

# Check Expo version
$expoCheck = npm list expo --depth=0 2>&1
if ($expoCheck -match "invalid") {
    Write-Host "⚠️  Expo version mismatch detected. Fixing..." -ForegroundColor Yellow
    Write-Host "`n📦 Cleaning and reinstalling dependencies..." -ForegroundColor Cyan
    
    # Clean
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    }
    if (Test-Path "package-lock.json") {
        Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
    }
    if (Test-Path ".expo") {
        Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
    }
    
    # Clear cache
    npm cache clean --force | Out-Null
    
    # Reinstall
    Write-Host "Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
    npm install
    
    Write-Host "✅ Dependencies fixed!" -ForegroundColor Green
} else {
    Write-Host "✅ Expo version is correct!" -ForegroundColor Green
}

Write-Host "`n🚀 Starting Expo and launching on emulator..." -ForegroundColor Cyan
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "1. Start Metro bundler" -ForegroundColor White
Write-Host "2. Automatically launch app on Android emulator" -ForegroundColor White
Write-Host "`nPress Ctrl+C to stop" -ForegroundColor Gray

# Start Expo with auto-launch on Android
# Using --android flag to automatically launch on Android
npx expo start --android
