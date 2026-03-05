@echo off
echo.
echo ========================================
echo   Starting Expo for iPhone Connection
echo ========================================
echo.
echo Your computer IP: 192.168.2.20
echo Port: 8081
echo.
echo Make sure your iPhone is on the same WiFi!
echo.
echo Starting Expo server...
echo.

npx expo start --lan --clear

pause
