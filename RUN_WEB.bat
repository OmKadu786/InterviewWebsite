@echo off
title VIP RIPIS Launcher
color 0A
echo ===================================================
echo       STARTING VIP INTERVIEW PLATFORM
echo ===================================================
echo.
echo 0. Cleaning up previous sessions...
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul

echo 1. Launching Backend Server...
start "RIPIS Backend" /min cmd /k "cd backend && python main.py"

echo 2. Launching Frontend Server...
start "RIPIS Frontend" /min cmd /k "cd frontend && npm run dev"

echo 3. Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo 4. Opening Website...
start http://localhost:5173

echo.
echo ===================================================
echo       WEBSITE IS RUNNING!
echo       (Keep this window open or minimized)
echo ===================================================
pause
