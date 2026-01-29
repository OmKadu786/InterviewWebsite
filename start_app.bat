@echo off
echo Starting RIPIS Application...

:: Start Backend
start "RIPIS Backend" cmd /k "cd backend && python main.py"

:: Start Frontend
start "RIPIS Frontend" cmd /k "cd frontend && npm run dev"

echo Application started!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8000
pause
