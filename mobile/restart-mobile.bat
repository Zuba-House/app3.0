@echo off
title Mobile App - Zuba
echo ========================================
echo Restarting Mobile App
echo ========================================
echo.
cd /d "%~dp0"
if not exist "package.json" (
    echo ERROR: Cannot find package.json
    echo Current directory: %CD%
    pause
    exit /b 1
)
echo Clearing cache and starting...
echo.
echo IMPORTANT: 
echo 1. Wait for QR code to appear
echo 2. Scan with Expo Go app (or press 'a' for Android emulator)
echo 3. Shake device and tap "Reload" to see UI changes
echo.
npx expo start --clear
pause
