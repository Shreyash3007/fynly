@echo off
REM Fynly Deployment Script for Windows (CMD)
REM Builds and deploys to Firebase Hosting

echo ========================================
echo   Fynly Deployment Script
echo ========================================
echo.

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Firebase CLI is not installed!
    echo Please run: npm install -g firebase-tools
    pause
    exit /b 1
)

echo [OK] Firebase CLI is installed
echo.

REM Run tests
echo Running tests...
npm run test
if %errorlevel% neq 0 (
    echo [WARNING] Tests failed! Continue anyway?
    set /p continue="Enter Y to continue, N to abort: "
    if /i not "%continue%"=="Y" (
        echo Deployment aborted.
        pause
        exit /b 1
    )
)
echo.

REM Run type check
echo Running type check...
npm run type-check
if %errorlevel% neq 0 (
    echo [ERROR] TypeScript errors found!
    echo Please fix type errors before deploying.
    pause
    exit /b 1
)
echo [OK] Type check passed
echo.

REM Build project
echo Building project...
npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)
echo [OK] Build completed
echo.

REM Deploy to Firebase
echo Deploying to Firebase Hosting...
firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo [ERROR] Deployment failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Deployment Successful!
echo ========================================
echo.
echo Your app has been deployed to Firebase Hosting
echo.

pause
