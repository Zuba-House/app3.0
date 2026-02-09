@echo off
echo Starting Mobile App (Expo)...
cd mobile
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
echo.
echo Starting Expo...
echo.
echo Scan QR code with Expo Go app on your phone
echo OR press 'a' for Android emulator
echo.
call npm start
pause


