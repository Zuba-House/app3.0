@echo off
echo Starting Mobile App on Android (Expo)...
cd mobile
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
echo.
echo Starting Expo and opening Android...
echo Make sure Android emulator is running!
echo.
call npm run android
pause


