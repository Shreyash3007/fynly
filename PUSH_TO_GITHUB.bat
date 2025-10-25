@echo off
echo ========================================
echo   FYNLY - Push to GitHub Script
echo ========================================
echo.

echo INSTRUCTIONS:
echo 1. Create a new repository on GitHub:
echo    https://github.com/new
echo.
echo 2. Name it: Fynly
echo 3. DO NOT initialize with README
echo 4. Copy the repository URL
echo.

set /p REPO_URL="Enter your GitHub repository URL: "

if "%REPO_URL%"=="" (
    echo ERROR: No URL provided!
    pause
    exit /b 1
)

echo.
echo [1/3] Adding remote...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
if errorlevel 1 (
    echo ERROR: Failed to add remote!
    pause
    exit /b 1
)
echo ✓ Remote added
echo.

echo [2/3] Setting branch to main...
git branch -M main
echo ✓ Branch set to main
echo.

echo [3/3] Pushing to GitHub...
git push -u origin main
if errorlevel 1 (
    echo ERROR: Push failed!
    echo.
    echo Try this command manually:
    echo git push -u origin main --force
    pause
    exit /b 1
)
echo ✓ Pushed to GitHub
echo.

echo ========================================
echo   SUCCESS!
echo ========================================
echo.
echo Your code is now on GitHub at:
echo %REPO_URL%
echo.
echo You can view it by opening the URL in your browser.
echo.
pause
