@echo off
echo ========================================
echo FORCE RELOAD - Complete App Restart
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Stopping Metro bundler...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Clearing all caches...
if exist .expo rmdir /s /q .expo
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .metro rmdir /s /q .metro
echo Cache cleared!

echo [3/4] Starting Metro with clear cache...
start "Metro Bundler" cmd /k "npm start -- --clear"

echo [4/4] Waiting for Metro to start...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo DONE! 
echo ========================================
echo.
echo Now in your app:
echo 1. Shake device (or press Ctrl+M on emulator)
echo 2. Select "Reload"
echo.
echo OR press 'r' in the Metro terminal to reload
echo.
pause
