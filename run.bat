@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo ======================================
echo       ASTI Website Launcher          
echo ======================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed.
    echo Please install Node.js ^(v20+^) from https://nodejs.org/
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo Installing project dependencies...
    call npm install
)

if not exist ".env" (
    if exist ".env.example" (
        echo Creating .env configuration file...
        copy .env.example .env >nul
    )
)

set PORT=3000
if exist ".env" (
    for /f "tokens=1,2 delims==" %%a in (.env) do (
        if "%%a"=="PORT" set PORT=%%b
    )
)

set URL=http://localhost:%PORT%
echo Starting server at %URL%...

start "" "%URL%"

call npm start
pause
