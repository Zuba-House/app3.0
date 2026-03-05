@echo off
echo.
echo ========================================
echo   Fixing Missing Dependencies
echo ========================================
echo.

echo Installing expo-device...
call npm install expo-device

echo.
echo Fixing package versions...
call npm install expo-notifications@~0.32.16 react-native-worklets@0.5.1

echo.
echo ========================================
echo   Dependencies Fixed!
echo ========================================
echo.
echo Now run: npm run start:lan
echo.

pause
