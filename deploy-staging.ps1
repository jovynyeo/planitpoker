param(
    [string]$CommitMessage = "Deploy to staging",
    [string]$WebhookUrl = "REPLACE_WITH_YOUR_NEW_WEBHOOK_URL"
)

Write-Host "🚀 Deploying to Vercel Staging..." -ForegroundColor Green
Write-Host "📝 Commit message: $CommitMessage" -ForegroundColor Yellow

# Check if webhook URL is provided
if ($WebhookUrl -eq "REPLACE_WITH_YOUR_NEW_WEBHOOK_URL" -or [string]::IsNullOrEmpty($WebhookUrl)) {
    Write-Host "❌ Webhook URL is required!" -ForegroundColor Red
    Write-Host "   Get it from: Vercel Dashboard → storyscore-stg → Settings → Git → Deploy Hooks" -ForegroundColor Yellow
    Write-Host "   Usage: ./deploy-staging.ps1 'commit message' 'webhook-url'" -ForegroundColor Cyan
    exit 1
}

# Add all changes
git add .

# Commit changes
git commit -m "$CommitMessage"

# Push to staging branch
git push origin staging

# Trigger Vercel deployment
Write-Host "🔄 Triggering Vercel deployment..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $WebhookUrl -Method POST -UseBasicParsing
    Write-Host "✅ Deployment triggered successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to trigger deployment: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "📊 Check Vercel dashboard: https://vercel.com/dashboard" -ForegroundColor Blue
Write-Host "🌐 Staging URL will be updated automatically" -ForegroundColor Blue