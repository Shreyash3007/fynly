# Fynly Deployment Script for Windows (PowerShell)
# Builds and deploys to Firebase Hosting

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fynly Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
Write-Host "Checking Firebase CLI..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version
    Write-Host "[OK] Firebase CLI installed: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Firebase CLI is not installed!" -ForegroundColor Red
    Write-Host "Please run: npm install -g firebase-tools" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Run tests
Write-Host "Running tests..." -ForegroundColor Yellow
npm run test
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Tests failed!" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? [Y/N]"
    if ($continue -ne "Y" -and $continue -ne "y") {
        Write-Host "Deployment aborted." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}
Write-Host ""

# Run type check
Write-Host "Running type check..." -ForegroundColor Yellow
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] TypeScript errors found!" -ForegroundColor Red
    Write-Host "Please fix type errors before deploying." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[OK] Type check passed" -ForegroundColor Green
Write-Host ""

# Build project
Write-Host "Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[OK] Build completed" -ForegroundColor Green
Write-Host ""

# Deploy to Firebase
Write-Host "Deploying to Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Deployment failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Successful!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your app has been deployed to Firebase Hosting" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"


