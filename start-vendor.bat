@echo off
title Vendor Dashboard
echo ========================================
echo Starting Vendor Dashboard...
echo ========================================
echo.
cd /d "%~dp0vendor"
if not exist "package.json" (
    echo ERROR: Cannot find vendor/package.json
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
