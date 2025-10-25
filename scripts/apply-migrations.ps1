
# Apply Supabase Migrations Script
# This script applies all database migrations to your Supabase project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Supabase Migration Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Method 1: Via Supabase CLI (Recommended)
Write-Host "Method 1: Using Supabase CLI" -ForegroundColor Yellow
Write-Host "Attempting to push migrations..." -ForegroundColor Yellow
Write-Host ""

npx supabase db push 2>&1 | Tee-Object -Variable output

if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Migrations applied successfully!" -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "[WARNING] CLI method failed. Trying alternative method..." -ForegroundColor Yellow
Write-Host ""

# Method 2: Direct Database Connection
Write-Host "Method 2: Direct Database URL" -ForegroundColor Yellow
Write-Host ""
Write-Host "To use this method, you need your database password from Supabase." -ForegroundColor Cyan
Write-Host "Find it at: Settings > Database > Database password" -ForegroundColor Cyan
Write-Host ""

$dbPassword = Read-Host "Enter your database password (or press Enter to skip)"

if ($dbPassword) {
    $dbUrl = "postgresql://postgres:$dbPassword@db.yzbopliavpqiicvyqvun.supabase.co:5432/postgres"
    Write-Host "Pushing migrations with direct connection..." -ForegroundColor Yellow
    
    npx supabase db push --db-url $dbUrl
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Migrations applied successfully!" -ForegroundColor Green
        exit 0
    }
}

# Method 3: Manual SQL Execution Instructions
Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "  Automated methods failed" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "Please apply migrations manually:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to: https://supabase.com/dashboard/project/yzbopliavpqiicvyqvun/sql/new" -ForegroundColor White
Write-Host ""
Write-Host "2. Run these files in order:" -ForegroundColor White
Write-Host "   a) supabase/migrations/20240101000001_init_schema.sql" -ForegroundColor Cyan
Write-Host "   b) supabase/migrations/20240101000002_rls_policies.sql" -ForegroundColor Cyan
Write-Host "   c) supabase/migrations/20240101000003_auth_triggers.sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Copy the contents of each file" -ForegroundColor White
Write-Host "4. Paste into the SQL Editor" -ForegroundColor White
Write-Host "5. Click 'Run' or press Ctrl+Enter" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"

