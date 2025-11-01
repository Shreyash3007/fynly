# PowerShell Script for Supabase Management
# Automates all Supabase operations

param(
    [string]$Action = "status",
    [string]$ProjectRef = "wvqevwjcaigyqlyeizon"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 SUPABASE AUTOMATED MANAGEMENT" -ForegroundColor Cyan
Write-Host "=" * 50
Write-Host "Project: $ProjectRef"
Write-Host "Action: $Action"
Write-Host ""

# Check Supabase CLI
function Test-SupabaseCLI {
    try {
        $version = supabase --version 2>&1
        return $true
    } catch {
        return $false
    }
}

# Install Supabase CLI
function Install-SupabaseCLI {
    Write-Host "📦 Installing Supabase CLI..." -ForegroundColor Yellow
    npm install -g supabase
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Supabase CLI installed" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Failed to install" -ForegroundColor Red
        return $false
    }
}

# Check login status
function Test-SupabaseLogin {
    try {
        supabase projects list | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Link project
function Link-Project {
    param([string]$Ref)
    Write-Host "🔗 Linking to project: $Ref" -ForegroundColor Yellow
    supabase link --project-ref $Ref
}

# Push migrations
function Push-Migrations {
    Write-Host "📤 Pushing migrations..." -ForegroundColor Yellow
    supabase db push
}

# Get project status
function Get-ProjectStatus {
    Write-Host "📊 Getting project status..." -ForegroundColor Yellow
    supabase status
}

# Run SQL file
function Run-SQLFile {
    param([string]$FilePath)
    Write-Host "📄 Running SQL file: $FilePath" -ForegroundColor Yellow
    
    if (Test-Path $FilePath) {
        $sql = Get-Content $FilePath -Raw
        Write-Host "⚠️  To run SQL files, use Supabase Dashboard SQL Editor" -ForegroundColor Yellow
        Write-Host "   URL: https://supabase.com/dashboard/project/$ProjectRef/sql/new" -ForegroundColor Cyan
    } else {
        Write-Host "❌ File not found: $FilePath" -ForegroundColor Red
    }
}

# Main execution
switch ($Action.ToLower()) {
    "install" {
        if (-not (Test-SupabaseCLI)) {
            Install-SupabaseCLI
        } else {
            $version = supabase --version
            Write-Host "✅ Supabase CLI already installed: $version" -ForegroundColor Green
        }
    }
    "login" {
        Write-Host "🔐 Login to Supabase..." -ForegroundColor Yellow
        Write-Host "   Get access token from: https://supabase.com/dashboard/account/tokens" -ForegroundColor Cyan
        supabase login
    }
    "link" {
        if (-not (Test-SupabaseCLI)) {
            Install-SupabaseCLI
        }
        Link-Project -Ref $ProjectRef
    }
    "push" {
        if (-not (Test-SupabaseCLI)) {
            Write-Host "❌ Supabase CLI not installed" -ForegroundColor Red
            exit 1
        }
        if (-not (Test-SupabaseLogin)) {
            Write-Host "❌ Not logged in. Run: supabase login" -ForegroundColor Red
            exit 1
        }
        Push-Migrations
    }
    "status" {
        if (-not (Test-SupabaseCLI)) {
            Write-Host "⚠️  Supabase CLI not installed" -ForegroundColor Yellow
            Write-Host "   Install with: npm install -g supabase" -ForegroundColor Cyan
        } else {
            Get-ProjectStatus
        }
    }
    "setup" {
        $setupFile = "supabase\setup-database.sql"
        Run-SQLFile -FilePath $setupFile
    }
    default {
        Write-Host "Available actions:" -ForegroundColor Yellow
        Write-Host "  install  - Install Supabase CLI"
        Write-Host "  login    - Login to Supabase"
        Write-Host "  link     - Link to remote project"
        Write-Host "  push     - Push migrations"
        Write-Host "  status   - Get project status"
        Write-Host "  setup    - Show setup instructions"
    }
}

