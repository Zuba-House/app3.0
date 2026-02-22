@echo off
echo ========================================
echo   Fix All Issues and Run Mobile App
echo ========================================
echo.

cd mobile

echo Step 1: Running comprehensive fix...
powershell -ExecutionPolicy Bypass -File .\FIX_ALL_ISSUES.ps1

echo.
echo Step 2: Starting app on Android emulator...
echo Make sure Android emulator is running!
echo.

npx expo start --android

pause
