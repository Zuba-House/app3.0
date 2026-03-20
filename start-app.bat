@echo off
echo Starting Zuba House Mobile App...
echo.
cd /d "%~dp0\mobile"
call npx expo start --clear
pause
