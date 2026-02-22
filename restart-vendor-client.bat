@echo off
echo ========================================
echo Restarting Vendor and Client Apps
echo ========================================
echo.

echo Current directory: %CD%
echo.

echo Stopping any running Node processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% == 0 (
    echo Node processes stopped.
) else (
    echo No Node processes found or already stopped.
)
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo Starting Vendor Dashboard...
echo ========================================
cd /d "%~dp0vendor"
if not exist "package.json" (
    echo ERROR: vendor/package.json not found!
    echo Current path: %CD%
    pause
    exit /b 1
)
echo Installing dependencies if needed...
call npm install >nul 2>&1
echo Starting dev server...
start "Vendor Dashboard" cmd /k "cd /d %~dp0vendor && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo Starting Client App...
echo ========================================
cd /d "%~dp0client"
if not exist "package.json" (
    echo ERROR: client/package.json not found!
    echo Current path: %CD%
    pause
    exit /b 1
)
echo Installing dependencies if needed...
call npm install >nul 2>&1
echo Starting dev server...
start "Client App" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ========================================
echo Both apps are starting in new windows!
echo ========================================
echo.
echo IMPORTANT: 
echo 1. Check the new command windows that opened
echo 2. Wait for servers to start (look for "Local: http://localhost:XXXX")
echo 3. Open browser and go to the URLs shown
echo 4. Press Ctrl+Shift+R to hard refresh (clear cache)
echo.
echo Press any key to close this window...
pause >nul
