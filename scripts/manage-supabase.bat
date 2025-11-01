@echo off
REM Batch Script for Supabase Management on Windows
REM Usage: manage-supabase.bat [action] [project-ref]

setlocal enabledelayedexpansion

set ACTION=%~1
if "%ACTION%"=="" set ACTION=status

set PROJECT_REF=%~2
if "%PROJECT_REF%"=="" set PROJECT_REF=wvqevwjcaigyqlyeizon

echo.
echo ========================================
echo   SUPABASE AUTOMATED MANAGEMENT
echo ========================================
echo Project: %PROJECT_REF%
echo Action: %ACTION%
echo.

REM Check if Supabase CLI is installed
where supabase >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Supabase CLI not found
    echo.
    echo Installing Supabase CLI...
    call npm install -g supabase
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install Supabase CLI
        exit /b 1
    )
    echo [OK] Supabase CLI installed
)

if "%ACTION%"=="install" (
    echo [OK] Supabase CLI is installed
    supabase --version
    goto :end
)

if "%ACTION%"=="login" (
    echo [INFO] Logging in to Supabase...
    echo [INFO] Get access token from: https://supabase.com/dashboard/account/tokens
    supabase login
    goto :end
)

if "%ACTION%"=="link" (
    echo [INFO] Linking to project: %PROJECT_REF%
    supabase link --project-ref %PROJECT_REF%
    goto :end
)

if "%ACTION%"=="push" (
    echo [INFO] Pushing database migrations...
    supabase db push
    goto :end
)

if "%ACTION%"=="status" (
    echo [INFO] Getting project status...
    supabase status 2>nul || echo [INFO] Run 'supabase link' first to connect to project
    goto :end
)

if "%ACTION%"=="setup" (
    echo [INFO] Database Setup Instructions:
    echo.
    echo 1. Open Supabase SQL Editor:
    echo    https://supabase.com/dashboard/project/%PROJECT_REF%/sql/new
    echo.
    echo 2. Run the setup script:
    echo    supabase\setup-database.sql
    echo.
    goto :end
)

echo [INFO] Available actions:
echo   install  - Install Supabase CLI
echo   login    - Login to Supabase
echo   link     - Link to remote project
echo   push     - Push migrations
echo   status   - Get project status
echo   setup    - Show setup instructions

:end
endlocal

