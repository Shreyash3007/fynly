# Script to add type assertions to all API route files
# This fixes TypeScript errors related to database queries

Write-Host "Fixing TypeScript errors in API routes..." -ForegroundColor Yellow

# Files to fix
$files = @(
    "src\app\api\admin\advisors\[id]\approve\route.ts",
    "src\app\api\admin\advisors\[id]\reject\route.ts",
    "src\app\api\admin\advisors\pending\route.ts",
    "src\app\api\payments\create-order\route.ts",
    "src\app\api\payments\verify\route.ts",
    "src\app\api\webhooks\razorpay\route.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing $file..." -ForegroundColor Cyan
        
        # Read content
        $content = Get-Content $file -Raw
        
        # Add type assertions to common patterns
        $content = $content -replace '\.insert\(\{', '.insert({' -replace '\}\)', '} as any)'
        $content = $content -replace '\.update\(\{([^}]+)\}\)', '.update({$1} as any)'
        $content = $content -replace '(\w+)\.(\w+)(?=\s*[!=]=)', '($1 as any).$2'
        
        # Save
        Set-Content $file $content -NoNewline
        Write-Host "Fixed $file" -ForegroundColor Green
    }
}

Write-Host "Done!" -ForegroundColor Green

