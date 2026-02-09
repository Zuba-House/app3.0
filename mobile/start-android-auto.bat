@echo off
echo Starting Mobile App on Android Emulator (Auto-Launch)...
cd mobile
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
echo.
echo Starting Expo and auto-launching on Android emulator...
echo Make sure Android emulator is running!
echo.
powershell -ExecutionPolicy Bypass -File .\AUTO_RUN_EMULATOR.ps1
pause
