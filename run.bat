@echo off
title FlowerShop - Start Servers
echo ========================================
echo     Starting FlowerShop Full-Stack App
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Navigate to project root (assuming run from project folder)
if not exist "backend" (
    echo [ERROR] Backend folder not found. Make sure you're in the project root.
    pause
    exit /b 1
)

echo [INFO] Starting Backend (port 5000)...
cd backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
) else (
    echo Backend dependencies already installed.
)
start "FlowerShop Backend" cmd /k "title Backend Server && echo Backend starting on http://localhost:5000 && npm run dev"
cd ..

echo [INFO] Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo [INFO] Starting Frontend (port 3000)...
cd frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
) else (
    echo Frontend dependencies already installed.
)
start "FlowerShop Frontend" cmd /k "title Frontend Server && echo Frontend starting on http://localhost:3000 && npm start"
cd ..

echo.
echo ========================================
echo     Servers Started Successfully!
echo ========================================
echo - Backend: http://localhost:5000/api/health
echo - Frontend: http://localhost:3000
echo.
echo Press any key to close...
pause >nul