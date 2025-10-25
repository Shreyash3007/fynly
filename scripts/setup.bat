@echo off
REM Fynly Setup Script for Windows (CMD)
REM Installs dependencies and sets up the project

echo ========================================
echo   Fynly Setup Script
echo ========================================
echo.

REM Check Node.js
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js v18+ from https://nodejs.org
    pause
    exit /b 1
)

REM Check npm
echo Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)

echo [OK] Node.js and npm are installed
echo.

REM Install dependencies
echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [OK] Dependencies installed
echo.

REM Create .env.local if it doesn't exist
if not exist .env.local (
    echo Creating .env.local file...
    copy .env.local.example .env.local
    echo [OK] Created .env.local from example
    echo [ACTION REQUIRED] Please edit .env.local with your credentials
) else (
    echo [INFO] .env.local already exists
)
echo.

REM Install global tools (optional)
echo.
echo Do you want to install global tools? (supabase, firebase-tools)
set /p install_global="Enter Y for Yes, N for No: "

if /i "%install_global%"=="Y" (
    echo Installing global tools...
    npm install -g supabase firebase-tools
    if %errorlevel% neq 0 (
        echo [WARNING] Failed to install global tools
    ) else (
        echo [OK] Global tools installed
    )
)
echo.

REM Setup complete
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env.local with your API keys
echo 2. Run: npm run dev
echo 3. Open: http://localhost:3000
echo.
echo For more information, see README.md
echo.

pause
