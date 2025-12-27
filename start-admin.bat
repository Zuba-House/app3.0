@echo off
echo Starting Admin Panel...
cd admin
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
echo Starting development server...
call npm run dev
pause


