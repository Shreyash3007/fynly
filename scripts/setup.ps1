# Fynly Setup Script for Windows (PowerShell)
# Installs dependencies and sets up the project

Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  Fynly Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js v18+ from https://nodejs.org" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check npm
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "[OK] npm installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] npm is not installed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[OK] Dependencies installed" -ForegroundColor Green
Write-Host ""

# Create .env.local if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    Copy-Item ".env.local.example" ".env.local"
    Write-Host "[OK] Created .env.local from example" -ForegroundColor Green
    Write-Host "[ACTION REQUIRED] Please edit .env.local with your credentials" -ForegroundColor Yellow
} else {
    Write-Host "[INFO] .env.local already exists" -ForegroundColor Cyan
}
Write-Host ""

# Install global tools (optional)
$installGlobal = Read-Host "Do you want to install global tools? (supabase, firebase-tools) [Y/N]"
if ($installGlobal -eq "Y" -or $installGlobal -eq "y") {
    Write-Host "Installing global tools..." -ForegroundColor Yellow
    npm install -g supabase firebase-tools
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Global tools installed" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Failed to install some global tools" -ForegroundColor Yellow
    }
}
Write-Host ""

# Setup complete
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env.local with your API keys"
Write-Host "2. Run: npm run dev"
Write-Host "3. Open: http://localhost:3000"
Write-Host ""
Write-Host "For more information, see README.md"
Write-Host ""

Read-Host "Press Enter to exit"
