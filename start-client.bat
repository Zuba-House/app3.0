@echo off
title Client App
echo ========================================
echo Starting Client App...
echo ========================================
echo.
cd /d "%~dp0client"
if not exist "package.json" (
    echo ERROR: Cannot find client/package.json
    echo Current directory: %CD%
    echo Script location: %~dp0
    pause
    exit /b 1
)
echo Found package.json, starting server...
echo.
npm run dev
if errorlevel 1 (
    echo.
    echo ERROR: Failed to start server
    echo Make sure you have run: npm install
    pause
)
