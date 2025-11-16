@echo off
REM Fynly MVP v1.0 - GitHub Deployment Script (Windows)

echo 🚀 Deploying Fynly MVP to GitHub...

REM Step 1: Check if GitHub CLI is installed
where gh >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ GitHub CLI (gh) is not installed.
    echo 📥 Install it from: https://cli.github.com/
    exit /b 1
)

REM Step 2: Check if logged in
gh auth status >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 🔐 Please login to GitHub...
    gh auth login
)

REM Step 3: Initialize git if needed
if not exist .git (
    echo 📦 Initializing git repository...
    git init
)

REM Step 4: Add all files
echo 📝 Adding files to git...
git add .

REM Step 5: Commit
echo 💾 Committing changes...
git commit -m "Phase 10: Complete MVP implementation with Supabase integration" 2>nul || echo No changes to commit

REM Step 6: Create repository on GitHub (if it doesn't exist)
set REPO_NAME=fynly
echo 🔨 Creating repository: %REPO_NAME%...

REM Check if repo already exists
gh repo view Shreyash3007/%REPO_NAME% >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Repository already exists, setting remote...
    git remote remove origin 2>nul
    git remote add origin https://github.com/Shreyash3007/%REPO_NAME%.git
) else (
    echo 🆕 Creating new repository...
    gh repo create Shreyash3007/%REPO_NAME% --public --source=. --remote=origin --push
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Deployment complete!
        echo 🌐 Repository: https://github.com/Shreyash3007/%REPO_NAME%
        echo 🚀 Vercel will automatically deploy from GitHub!
        exit /b 0
    )
)

REM Step 7: Push to GitHub
echo ⬆️  Pushing to GitHub...
git branch -M main
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo ✅ Deployment complete!
    echo 🌐 Repository: https://github.com/Shreyash3007/%REPO_NAME%
    echo 🚀 Vercel will automatically deploy from GitHub!
) else (
    echo ❌ Push failed. Please check your GitHub authentication.
)

