@echo off
echo ========================================
echo   FYNLY - Complete Deployment Script
echo ========================================
echo.

echo [1/5] Checking Firebase CLI...
call firebase --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Firebase CLI not found!
    echo Please install: npm install -g firebase-tools
    pause
    exit /b 1
)
echo ✓ Firebase CLI found
echo.

echo [2/5] Logging into Firebase...
call firebase login
if errorlevel 1 (
    echo ERROR: Firebase login failed!
    pause
    exit /b 1
)
echo ✓ Logged in to Firebase
echo.

echo [3/5] Building production app...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo ✓ Build successful
echo.

echo [4/5] Deploying to Firebase...
call firebase deploy --only hosting
if errorlevel 1 (
    echo ERROR: Deployment failed!
    pause
    exit /b 1
)
echo ✓ Deployed to Firebase
echo.

echo [5/5] Opening live site...
start https://fynly-financial-advisor.web.app
echo.

echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your app is now live at:
echo https://fynly-financial-advisor.web.app
echo.
echo GitHub Repository: 
echo (Please create manually and push code)
echo.
pause
