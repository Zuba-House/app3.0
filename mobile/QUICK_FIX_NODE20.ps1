# Quick Fix Script: Switch to Node 20 and Start Expo
# Run this in a NEW PowerShell window (close all terminals first)

Write-Host "🔧 Fixing Node Version Issue..." -ForegroundColor Yellow
Write-Host "`n⚠️  IMPORTANT: If nvm commands fail, install Node 20 manually from nodejs.org" -ForegroundColor Red
Write-Host "`n📋 Step 1: Checking nvm..." -ForegroundColor Cyan

# Check if nvm is available
try {
    $nvmVersion = nvm version 2>&1
    Write-Host "✅ nvm found: $nvmVersion" -ForegroundColor Green
    
    Write-Host "`n📋 Step 2: Installing Node 20.11.1..." -ForegroundColor Cyan
    nvm install 20.11.1
    
    Write-Host "`n📋 Step 3: Switching to Node 20..." -ForegroundColor Cyan
    nvm use 20.11.1
    
    Write-Host "`n📋 Step 4: Verifying Node version..." -ForegroundColor Cyan
    $nodeVersion = node -v
    $nodePath = where.exe node
    
    Write-Host "✅ Node version: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ Node path: $nodePath" -ForegroundColor Green
    
    if ($nodeVersion -like "v20.*") {
        Write-Host "`n✅ Node 20 is active!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Node version is still not 20.x" -ForegroundColor Red
        Write-Host "Please install Node 20 manually from https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "`n❌ nvm command failed. Error: $_" -ForegroundColor Red
    Write-Host "`n💡 Alternative: Install Node 20 manually:" -ForegroundColor Yellow
    Write-Host "1. Go to https://nodejs.org/" -ForegroundColor White
    Write-Host "2. Download Node 20.x LTS Windows Installer" -ForegroundColor White
    Write-Host "3. Run installer and check 'Add to PATH'" -ForegroundColor White
    Write-Host "4. Close and reopen PowerShell" -ForegroundColor White
    Write-Host "5. Run: node -v (should show v20.x)" -ForegroundColor White
    exit 1
}

Write-Host "`n📋 Step 5: Cleaning project..." -ForegroundColor Cyan
Set-Location "C:\Users\User\Desktop\zuba-app3.0\web\mobile"

if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
    Write-Host "✅ Removed node_modules" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json
    Write-Host "✅ Removed package-lock.json" -ForegroundColor Green
}

if (Test-Path ".expo") {
    Remove-Item -Recurse -Force .expo
    Write-Host "✅ Removed .expo cache" -ForegroundColor Green
}

Write-Host "`n📋 Step 6: Clearing npm cache..." -ForegroundColor Cyan
npm cache clean --force | Out-Null
Write-Host "✅ Cache cleared" -ForegroundColor Green

Write-Host "`n📋 Step 7: Installing dependencies..." -ForegroundColor Cyan
Write-Host "This may take a few minutes..." -ForegroundColor Yellow
npm install

Write-Host "`n📋 Step 8: Starting Expo..." -ForegroundColor Cyan
Write-Host "`n🚀 Expo is starting..." -ForegroundColor Green
Write-Host "Press 'a' for Android emulator OR scan QR code with Expo Go`n" -ForegroundColor Yellow

npx expo start --clear

