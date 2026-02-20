@echo off
del C:\Users\gergo.LOQI\projects\f1_app\backend\logs\app.log
title F1 App - Docker Startup
echo ==========================================
echo   🏎️  Starting F1 Full-Stack App
echo ==========================================

REM -- Move to the script's directory
cd /d "%~dp0"

REM -- Optional: stop any old containers
echo Stopping old containers...
docker compose down

REM -- Build and start everything
echo Building and starting containers...
docker compose up -d --build

REM -- Wait a bit before checking
echo Waiting for containers to start...
timeout /t 5 >nul

REM -- Show running containers
echo ==========================================
echo Running containers:
docker ps
echo ==========================================

echo ✅ All systems up! Press any key to exit.
pause
