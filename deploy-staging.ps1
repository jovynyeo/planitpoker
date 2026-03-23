param(
    [string]$CommitMessage = "Deploy to staging"
)

Write-Host "🚀 Deploying to Vercel Staging..." -ForegroundColor Green
Write-Host "📝 Commit message: $CommitMessage" -ForegroundColor Yellow

# Add all changes
git add .

# Commit changes
git commit -m "$CommitMessage"

# Push to staging branch
git push origin staging

# Trigger Vercel deployment
Write-Host "🔄 Triggering Vercel deployment..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://api.vercel.com/v1/integrations/deploy/prj_lRYOhlEizpUUVzw0EYcfgPLV25Mm/iSksnsbBA3" -Method POST -UseBasicParsing
    Write-Host "✅ Deployment triggered successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to trigger deployment: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "📊 Check Vercel dashboard: https://vercel.com/dashboard" -ForegroundColor Blue
Write-Host "🌐 Staging URL will be updated automatically" -ForegroundColor Blue